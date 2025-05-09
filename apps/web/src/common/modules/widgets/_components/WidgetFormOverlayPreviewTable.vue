<script setup lang="ts">

import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import bytes from 'bytes';
import { sortBy } from 'lodash';

import {
    PToolbox, PI, PSelectDropdown, PEmpty, PSpinner,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import { byteFormatter, numberFormatter } from '@cloudforet/utils';

import type { Page } from '@/api-clients/_common/schema/type';
import type { DataTableLoadResponse } from '@/api-clients/dashboard/_types/widget-type';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import type { DataTableLoadParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/load';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { useDataTableLoadQuery } from '@/common/modules/widgets/_composables/use-data-table-load-query';
import { useWidgetDataTableListQuery } from '@/common/modules/widgets/_composables/use-widget-data-table-list-query';
import { DATA_TABLE_OPERATOR } from '@/common/modules/widgets/_constants/data-table-constant';
import { REFERENCE_FIELD_MAP } from '@/common/modules/widgets/_constants/widget-constant';
import { sortWidgetTableFields } from '@/common/modules/widgets/_helpers/widget-helper';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { DataInfo } from '@/common/modules/widgets/types/widget-model';

import { gray, white } from '@/styles/colors';

import { useDashboardRefinedVars } from '@/services/_shared/dashboard/dashboard-detail/contextual-composables/use-dashboard-refined-vars';
import { SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import type { Granularity } from '@/services/cost-explorer/types/cost-explorer-query-type';





interface PreviewTableField {
    type: 'LABEL' | 'DATA' | 'DIVIDER';
    name: string;
    sortKey?: string;
    reference?: 'project'|'workspace'|'region'|'serviceAccount';
}

type DataTableModel = PublicDataTableModel|PrivateDataTableModel;

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();
const route = useRoute();
const dashboardId = computed(() => route.params.dashboardId);
const { refinedVars } = useDashboardRefinedVars(dashboardId);

/* Query */
const {
    dataTableList,
} = useWidgetDataTableListQuery({
    widgetId: computed(() => widgetGenerateState.widgetId),
});

const storeState = reactive({
    selectedDataTableId: computed<string|undefined>(() => widgetGenerateState.selectedDataTableId),
    dataTableLoadFailed: computed(() => widgetGenerateState.dataTableLoadFailed),
    // reference
    project: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    workspace: computed(() => allReferenceStore.getters.workspace),
    region: computed(() => allReferenceStore.getters.region),
    serviceAccount: computed(() => allReferenceStore.getters.serviceAccount),
});

const state = reactive({
    isPrivate: computed(() => storeState.selectedDataTableId?.startsWith('private')),
    selectedDataTable: computed<DataTableModel|undefined>(() => dataTableList.value.find((d) => d.data_table_id === storeState.selectedDataTableId)),
    data: computed<DataTableLoadResponse | null>(() => queryResult?.data?.value || null),
    labelFields: computed<string[]>(() => (dataTableLoading.value === true ? [] : sortWidgetTableFields(Object.keys(state.selectedDataTable?.labels_info ?? {})))),
    dataFields: computed<string[]>(() => (dataTableLoading.value === true ? [] : sortWidgetTableFields(Object.keys(state.selectedDataTable?.data_info ?? {})))),
    dataInfo: computed<DataInfo|undefined>(() => state.selectedDataTable?.data_info),
    isPivot: computed<boolean>(() => state.selectedDataTable?.operator === DATA_TABLE_OPERATOR.PIVOT),
    pivotColumn: computed<string|undefined>(() => state.selectedDataTable?.options?.[DATA_TABLE_OPERATOR.PIVOT]?.fields?.column),
    isAutoTypeColumnPivot: computed<boolean>(() => state.isPivot && !!state.selectedDataTable?.options?.[DATA_TABLE_OPERATOR.PIVOT]?.limit),
    // pivotSortKeys: computed<string[]>(() => (state.isPivot ? storeState.selectedDataTable?.sort_keys ?? [] : [])),
    fields: computed<PreviewTableField[]>(() => {
        if (!storeState.selectedDataTableId || !state.data?.results?.length) {
            return [{
                type: 'DIVIDER',
                name: '',
            }];
        }

        const dataFields: PreviewTableField[] = [];
        if (state.isPivot) {
            const headers = state.data.order ?? [];
            sortBy(state.dataFields, (field) => {
                const index = headers.indexOf(field);
                return index === -1 ? Infinity : index;
            }).forEach((field) => {
                dataFields.push({
                    name: field,
                    type: 'DATA',
                    reference: state.pivotColumn,
                });
            });
        } else {
            dataFields.push(...state.dataFields.map((key) => ({
                type: 'DATA',
                name: key,
            })));
        }

        return [
            ...state.labelFields.map((key) => ({
                type: 'LABEL',
                name: key,
                sortKey: key,
            }))
                .filter((field) => {
                    const _granularity = state.selectedGranularity;
                    if (state.labelFields.some((d) => d === 'Year' || d === 'Month' || d === 'Date')) {
                        if (_granularity === GRANULARITY.DAILY && (field.name === 'Year' || field.name === 'Month')) return false;
                        if (_granularity === GRANULARITY.MONTHLY && (field.name === 'Year' || field.name === 'Day')) return false;
                        if (_granularity === GRANULARITY.YEARLY && (field.name === 'Month' || field.name === 'Day')) return false;
                    }
                    return true;
                }),
            {
                type: 'DIVIDER',
                name: '',
            },
            ...dataFields,
        ];
    }),
    isSeparatedDataTable: computed(() => !Object.keys(state.selectedDataTable?.labels_info ?? {}).includes('Date')),
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
    selectedGranularity: GRANULARITY.MONTHLY,
    dividerStyle: computed(() => ({
        padding: '0',
        width: '1px',
        'min-width': '1px',
        backgroundColor: storeState.selectedDataTableId && state.data?.results?.length && !dataTableLoading.value ? gray[900] : white,
    })),
    thisPage: 1,
    pageSize: 15,
    page: computed<Page|undefined>(() => {
        if (state.thisPage || state.pageSize) return { start: 1 + ((state.thisPage - 1) * state.pageSize), limit: state.pageSize };
        return undefined;
    }),
});

const emptyState = reactive({
    isUnavailableDataTable: computed(() => state.selectedDataTable?.state === 'UNAVAILABLE'),
    title: computed(() => {
        if (!storeState.selectedDataTableId) return i18n.t('COMMON.WIDGETS.PREVIEW_TABLE_EMPTY_TITLE');
        // if (storeState.dataTableLoadFailed && emptyState.isUnavailableDataTable) return i18n.t('DASHBOARDS.WIDGET.DATA_TABLE_LOAD_INVALID_GLOBAL_VARIALBE_TITLE');
        return '';
    }),
    description: computed(() => {
        if (!storeState.selectedDataTableId) return i18n.t('COMMON.WIDGETS.PREVIEW_TABLE_EMPTY_DESC');
        if (isError.value === true) return errorMessage.value;
        // if (storeState.dataTableLoadFailed && emptyState.isUnavailableDataTable) return i18n.t('DASHBOARDS.WIDGET.DATA_TABLE_LOAD_INVALID_GLOBAL_VARIABLE_DESC');
        if (!state.data?.results?.length) return i18n.t('DASHBOARDS.WIDGET.NO_DATA');
        return '';
    }),
});
/* Events */
const handleSelectGranularity = async (granularity: Granularity) => {
    state.selectedGranularity = granularity;
};


const handleClickSort = async (sortKey: string) => {
    let resultSortBy: { key: string; desc: boolean }[];
    if (state.sortBy.length && state.sortBy[0].key === sortKey) {
        resultSortBy = [{ key: sortKey, desc: !state.sortBy[0].desc }];
    } else {
        resultSortBy = [{ key: sortKey, desc: true }];
    }
    state.sortBy = resultSortBy;
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
        const referenceItem = storeState[referenceKey]?.[referenceValueKey];
        return referenceItem?.label || referenceItem?.name || referenceValueKey || '-';
    }
    if (field.type === 'DATA') {
        return itemValue ? valueFormatter(itemValue, field) : '-';
    }
    return item[field.name] || '-';
};

const getFieldName = (field: PreviewTableField) => {
    if (field.type === 'DATA' && !!field.reference && Object.keys(REFERENCE_FIELD_MAP).includes(field.reference)) {
        const referenceKey = REFERENCE_FIELD_MAP[field.reference];
        const refernceItem = storeState[referenceKey]?.[field.name];
        return refernceItem?.label || refernceItem?.name || field.name;
    }
    return field.name;
};

const getSortIcon = (field: PreviewTableField) => {
    // if (field.type === 'LABEL') {
    if (!state.sortBy.some((d) => d.key === field.sortKey || d.key === field.name)) {
        return 'ic_caret-down';
    }
    return state.sortBy[0]?.desc ? 'ic_caret-down-filled' : 'ic_caret-up-filled';
    // }
    // return '';
};

const queryResult = useDataTableLoadQuery({
    dataTableId: computed(() => storeState.selectedDataTableId),
    params: computed<DataTableLoadParameters>(() => ({
        data_table_id: storeState.selectedDataTableId as string,
        granularity: state.selectedGranularity,
        sort: state.sortBy,
        page: state.page,
        vars: refinedVars.value,
    })),
});
const dataTableLoading = computed<boolean>(() => queryResult.isLoading.value || queryResult.isFetching.value);
const isError = computed<boolean>(() => queryResult.isError.value);
const errorMessage = computed<string>(() => queryResult.error?.value?.message);


watch([() => storeState.selectedDataTableId, () => state.selectedDataTable], async ([dataTableId]) => {
    if (!dataTableId) return;
    state.thisPage = 1;
    state.sortBy = [];
}, { immediate: true });


onUnmounted(() => {
    widgetGenerateStore.setDataTableLoadFailed(false);
});

</script>

<template>
    <div class="widget-form-overlay-preview-table">
        <p-toolbox class="preview-toolbox"
                   :searchable="false"
                   :refreshable="false"
                   :page-size-options="[15, 30, 45]"
                   :page-size.sync="state.pageSize"
                   :this-page.sync="state.thisPage"
                   :total-count="state.data?.total_count"
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
                            <span>{{ state.selectedDataTable?.name }}</span>
                        </div>
                        <p-select-dropdown class="granularity-dropdown"
                                           :menu="state.granularityItems"
                                           :selected="state.selectedGranularity"
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
                            {{ getFieldName(field) }}
                            <!--                            <span v-if="state.dataInfo?.[field.name]?.timediff"-->
                            <!--                                  class="timediff-sub-text"-->
                            <!--                            >{{ getTimeDiffSubText(field) }}</span>-->
                            <p-i :name="getSortIcon(field)"
                                 class="sort-icon"
                                 @click="handleClickSort(field.name)"
                            />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="dataTableLoading === true"
                    class="no-data-wrapper"
                >
                    <p-empty>
                        <div class="preview-loader-contents">
                            <p-spinner size="xl" />
                            <span>
                                {{ $t('DASHBOARDS.WIDGET.DATA_TABLE_LOAD_LOADING') }}
                            </span>
                        </div>
                    </p-empty>
                </tr>
                <template v-else-if="storeState.selectedDataTableId && state.data?.results?.length">
                    <tr v-for="(item, rowIdx) in state.data.results"
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
            @apply flex justify-between pl-4 items-center gap-1;
            line-height: 2;

            &.data-field {
                @apply justify-end;
            }

            .timediff-sub-text {
                @apply text-gray-400 text-paragraph-sm;
            }
        }
        .sort-icon {
            @apply text-gray-500 float-right my-px;
            &:hover { cursor: pointer; }
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
                width: 100%;
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
            min-height: 2.25rem;

            &.data-field {
                @apply justify-end;
            }
        }
    }
}
</style>
