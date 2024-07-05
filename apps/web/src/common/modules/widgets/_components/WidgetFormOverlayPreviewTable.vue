<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import {
    PToolbox, PI, PSelectDropdown, PEmpty, PSpinner,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/src/navigation/toolbox/type';
import bytes from 'bytes';

import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import type { Page } from '@/schema/_common/type';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { gray, white } from '@/styles/colors';

import { SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import type { Granularity } from '@/services/cost-explorer/types/cost-explorer-query-type';

interface PreviewTableField {
    type: 'LABEL' | 'DATA' | 'DIVIDER';
    name: string;
    sortKey?: string;
}

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const widgetGenerateGetters = widgetGenerateStore.getters;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    previewData: computed(() => widgetGenerateState.previewData),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    selectedDataTable: computed(() => widgetGenerateGetters.selectedDataTable),
    loading: computed(() => widgetGenerateState.dataTableLoadLoading),
    dataTableUpdating: computed(() => widgetGenerateState.dataTableUpdating),
    // reference
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed(() => allReferenceStore.getters.workspace),
    region: computed(() => allReferenceStore.getters.region),
    serviceAccount: computed(() => allReferenceStore.getters.serviceAccount),
});

const state = reactive({
    data: undefined,
    labelFields: computed<string[]>(() => (storeState.loading ? [] : sortWidgetTableFields(Object.keys(storeState.selectedDataTable?.labels_info ?? {})))),
    dataFields: computed<string[]>(() => (storeState.loading ? [] : sortWidgetTableFields(Object.keys(storeState.selectedDataTable?.data_info ?? {})))),
    dataInfo: computed(() => storeState.selectedDataTable?.data_info),
    fields: computed<PreviewTableField[]>(() => [
        ...state.labelFields.map((key) => ({ type: 'LABEL', name: key, sortKey: key })),
        { type: 'DIVIDER', name: '' },
        ...state.dataFields.map((key) => ({ type: 'DATA', name: key })),
    ]),
    sortBy: [] as { key: string; desc: boolean }[],
    granularityItems: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: GRANULARITY.DAILY,
            label: 'Daily',
        },
        {
            type: 'item',
            name: GRANULARITY.MONTHLY,
            label: 'Monthly',
        },
        {
            type: 'item',
            name: GRANULARITY.YEARLY,
            label: 'Yearly',
        },
    ])),
    dividerStyle: computed(() => ({
        padding: '0',
        width: '1px',
        'min-width': '1px',
        backgroundColor: storeState.selectedDataTableId && !storeState.loading ? gray[900] : white,
    })),
    thisPage: 1,
});

const emptyState = reactive({
    title: computed(() => i18n.t('COMMON.WIDGETS.PREVIEW_TABLE_EMPTY_TITLE')),
    description: computed(() => i18n.t('COMMON.WIDGETS.PREVIEW_TABLE_EMPTY_DESC')),
});
/* Events */
const handleSelectGranularity = async (granularity: Granularity) => {
    if (!storeState.selectedDataTableId) return;
    widgetGenerateStore.setSelectedPreviewGranularity(granularity);
    await widgetGenerateStore.loadDataTable({
        data_table_id: storeState.selectedDataTableId,
    });
};

const handleChangeToolbox = async (options: ToolboxOptions) => {
    if (!storeState.selectedDataTableId) return;
    let page = undefined as Page|undefined;
    if (options.pageStart) page = { start: options.pageStart, limit: state.thisPage * 15 };
    if (options.pageLimit) page = { start: 1, limit: options.pageLimit };
    await widgetGenerateStore.loadDataTable({
        data_table_id: storeState.selectedDataTableId,
        page,
        sort: state.sortBy,
    });
};

const handleClickSort = async (sortKey: string) => {
    let resultSortBy: { key: string; desc: boolean }[];
    if (state.sortBy.length && state.sortBy[0].key === sortKey) {
        resultSortBy = [{ key: sortKey, desc: !state.sortBy[0].desc }];
    } else {
        resultSortBy = [{ key: sortKey, desc: true }];
    }
    state.sortBy = resultSortBy;
    if (!storeState.selectedDataTableId) return;
    await widgetGenerateStore.loadDataTable({
        data_table_id: storeState.selectedDataTableId,
        sort: resultSortBy,
    });
    state.thisPage = 1;
};

/* Utils */
const valueFormatter = (value, field: PreviewTableField) => {
    const _unit = state.dataInfo?.[field.name]?.unit;
    if (_unit && SIZE_UNITS.includes(_unit)) {
        const _originalVal = bytes.parse(`${value}${_unit}`);
        return byteFormatter(_originalVal);
    }
    return numberFormatter(value, { notation: 'compact' });
};

const getValue = (item, field: PreviewTableField) => {
    const itemValue = item[field.name];
    if (field.type === 'LABEL' && Object.keys(REFERENCE_FIELD_MAP).includes(field.name)) {
        const referenceKey = REFERENCE_FIELD_MAP[field.name];
        const referenceValueKey = item[field.name];
        return storeState[referenceKey][referenceValueKey]?.label || storeState[referenceKey][referenceValueKey]?.name || '-';
    }
    if (field.type === 'DATA') {
        return itemValue ? valueFormatter(itemValue, field) : '-';
    }
    return item[field.name] ?? '-';
};

const getSortIcon = (field: PreviewTableField) => {
    if (field.type === 'LABEL') {
        if (!state.sortBy.some((d) => d.key === field.sortKey || d.key === field.name)) {
            return 'ic_caret-down';
        }
        return state.sortBy[0]?.desc ? 'ic_caret-down-filled' : 'ic_caret-up-filled';
    }
    return '';
};

watch(() => storeState.selectedDataTableId, async (dataTableId) => {
    if (dataTableId) {
        state.thisPage = 1;
        state.sortBy = [];
    }
});

watch(() => storeState.dataTableUpdating, () => {
    if (storeState.dataTableUpdating) {
        state.thisPage = 1;
        state.sortBy = [];
    }
});

</script>

<template>
    <div class="widget-form-overlay-preview-table">
        <p-toolbox class="preview-toolbox"
                   :searchable="false"
                   :refreshable="false"
                   :page-size-options="[15, 30, 45]"
                   :page-size="15"
                   :this-page.sync="state.thisPage"
                   :total-count="storeState.previewData.total_count"
                   @change="handleChangeToolbox"
        >
            <template #left-area>
                <div class="toolbox-left-wrapper">
                    <span class="view-table-title">
                        Preview
                    </span>
                    <div v-if="storeState.selectedDataTableId"
                         class="granularity-wrapper"
                    >
                        <div class="data-label">
                            <p-i name="ic_service_data-sources"
                                 width="1rem"
                                 height="1rem"
                            />
                            <span>{{ storeState.selectedDataTable?.name }}</span>
                        </div>
                        <p-select-dropdown class="granularity-dropdown"
                                           :menu="state.granularityItems"
                                           :selected="widgetGenerateState.selectedPreviewGranularity"
                                           use-fixed-menu-style
                                           @select="handleSelectGranularity"
                        />
                    </div>
                </div>
            </template>
        </p-toolbox>
        <table>
            <thead>
                <tr>
                    <th v-for="(field, idx) in state.fields"
                        :key="`th-preview-${idx}`"
                        :style="field.type === 'DIVIDER' ? {...state.dividerStyle } : {}"
                    >
                        <span v-if="field.type === 'DIVIDER'" />
                        <span v-else
                              :class="{'th-contents': true, 'data-field': field.type === 'DATA'}"
                        >
                            {{ field.name }}
                            <p-i v-if="field.type === 'LABEL'"
                                 :name="getSortIcon(field)"
                                 class="sort-icon"
                                 @click="handleClickSort(field.name)"
                            />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="storeState.loading"
                    class="no-data-wrapper"
                >
                    <p-empty>
                        <div class="preview-loader-contents">
                            <p-spinner size="xl" />
                            <span>
                                Processing large amounts of data can take a while.
                            </span>
                        </div>
                    </p-empty>
                </tr>
                <template v-else-if="storeState.selectedDataTableId">
                    <tr v-for="(item, rowIdx) in storeState.previewData.results"
                        :key="`tr-preview-${rowIdx}`"
                        :data-index="rowIdx"
                    >
                        <td v-for="(field, idx) in state.fields"
                            :key="`td-preview-${idx}`"
                            :style="field.type === 'DIVIDER' ? {...state.dividerStyle, 'background-color': gray[300]} : {}"
                        >
                            <span v-if="field.type === 'DIVIDER'" />
                            <span v-else
                                  :class="{'td-contents': true, 'data-field': field.type === 'DATA'}"
                            >
                                {{ getValue(item, field) }}
                            </span>
                        </td>
                    </tr>
                </template>
                <tr v-else
                    class="no-data-wrapper"
                >
                    <p-empty class="preview-empty-contents">
                        <template #image>
                            <img src="@/assets/images/img_jellyocto-with-a-telescope.png"
                                 alt="image-preview-data-empty"
                            >
                        </template>
                        <template #default>
                            <p class="title">
                                {{ emptyState.title }}
                            </p>
                            <p class="description">
                                {{ emptyState.description }}
                            </p>
                        </template>
                    </p-empty>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-overlay-preview-table {
    @apply bg-white overflow-auto h-full w-full;
    height: 100%;
    overflow-y: scroll;

    .preview-toolbox {
        padding: 1rem 1rem 0 1rem;
    }

    table {
        @apply min-w-full;
        border-collapse: separate;
        border-spacing: 0;
    }
    th {
        @apply text-label-md font-bold border-t border-b border-gray-900 bg-white;
        height: 2rem;
        min-width: 8rem;

        .th-contents {
            @apply flex justify-between pl-4;
            line-height: 2;

            &.data-field {
                @apply justify-end;
            }
        }
        .sort-icon {
            @apply text-gray-500 float-right my-px;
            &:hover { cursor: pointer; }
        }
        &:last-child {
            .th-contents:not(.has-icon) {
                padding-right: 1rem;
            }
        }
    }

    .toolbox-left-wrapper {
        @apply flex items-center;
        gap: 0.75rem;
        height: 100%;
        .view-table-title {
            @apply text-label-lg font-bold;
        }
        .granularity-wrapper {
            @apply bg-gray-100 flex items-center rounded-lg gap-3;
            height: 2.5rem;
            padding: 0.25rem 0.25rem 0.25rem 0.75rem;
            margin: -0.25rem 0;

            .data-label {
                @apply flex items-center gap-1 text-label-md font-bold;
            }
            .granularity-dropdown {
                width: 15rem;
            }
        }
    }
    tbody {
        tr {
            &:hover {
                @apply bg-blue-100;
            }
        }
        .no-data-wrapper {
            width: 100%;

            &:hover {
                @apply bg-white;
            }
            .preview-empty-contents {
                @apply text-paragraph-md;
                padding: 2rem 0;
                .title {
                    @apply font-bold text-violet-300;
                }
                .description {
                    @apply text-gray-300;
                }
            }
            .preview-loader-contents {
                @apply flex flex-col items-center gap-2 w-full;
                padding: 3rem 0;
            }
        }
    }
    td {
        @apply px-4 z-0 align-middle min-w-28 text-sm border-b;
        min-width: 8rem;

        .td-contents {
            @apply inline-flex gap-2 items-center;
            width: 100%;
            height: 2.25rem;

            &.data-field {
                @apply justify-end;
            }
        }
    }
}
</style>
