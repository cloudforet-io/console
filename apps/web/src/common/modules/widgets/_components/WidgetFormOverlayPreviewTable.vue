<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import {
    PDataLoader, PToolbox, PI, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';


import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';

import { gray } from '@/styles/colors';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import type { Granularity } from '@/services/cost-explorer/types/cost-explorer-query-type';

interface PreviewTableField {
    type: 'LABEL' | 'DATA' | 'DIVIDER';
    name: string;
    sortKey?: string;
}

const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const widgetGenrateGetters = widgetGenerateStore.getters;

const storeState = reactive({
    previewData: computed(() => widgetGenerateState.previewData),
    selectedDataTableId: computed(() => widgetGenerateState.selectedDataTableId),
    selectedDataTable: computed(() => widgetGenrateGetters.selectedDataTable),
});

const state = reactive({
    loading: false,
    data: undefined,
    labelFields: computed<string[]>(() => Object.keys(storeState.selectedDataTable?.labels_info ?? {})),
    dataFields: computed<string[]>(() => Object.keys(storeState.selectedDataTable?.data_info ?? {})),
    fields: computed<PreviewTableField[]>(() => [
        ...state.labelFields.map((key) => ({ type: 'LABEL', name: key, sortKey: key })),
        { type: 'DIVIDER', name: '' },
        ...state.dataFields.map((key) => ({ type: 'DATA', name: key })),
    ]),
    sortBy: '',
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
        backgroundColor: gray[300],
    })),
});

/* Events */
const handleSelectGranularity = async (granularity: Granularity) => {
    if (!storeState.selectedDataTableId) return;
    widgetGenerateStore.setSelectedPreviewGranularity(granularity);
    await widgetGenerateStore.loadDataTable(storeState.selectedDataTableId);
};

watch(() => storeState.selectedDataTableId, async (dataTableId) => {
    if (dataTableId) {
        await widgetGenerateStore.loadDataTable(dataTableId);
    }
});

</script>

<template>
    <div class="widget-form-overlay-preview-table">
        <p-data-loader class="table-container"
                       :loading="state.loading"
                       :data="state.data"
                       :loader-backdrop-opacity="1"
        >
            <template #default>
                <p-toolbox class="preview-toolbox"
                           :searchable="false"
                >
                    <template #left-area>
                        <div class="toolbox-left-wrapper">
                            <span class="view-table-title">
                                Preview
                            </span>
                            <div class="granularity-wrapper">
                                <div class="data-label">
                                    <p-i name="ic_service_data-sources"
                                         width="1rem"
                                         height="1rem"
                                    />
                                    <span>Data 1</span>
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
                                :style="field.type === 'DIVIDER' ? {...state.dividerStyle, 'background-color': gray[900] } : {}"
                            >
                                <span v-if="field.type === 'DIVIDER'" />
                                <span v-else
                                      :class="{'th-contents': true, 'data-field': field.type === 'DATA'}"
                                >
                                    {{ field.name }}
                                    <p-i v-if="field.type === 'LABEL'"
                                         :name="(field.sortKey|| field.name) === state.sortBy ? 'ic_caret-down-filled' : 'ic_caret-down'"
                                         class="sort-icon"
                                    />
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, rowIdx) in storeState.previewData"
                            :key="`tr-preview-${rowIdx}`"
                            :data-index="rowIdx"
                        >
                            <td v-for="(field, idx) in state.fields"
                                :key="`td-preview-${idx}`"
                                :style="field.type === 'DIVIDER' ? state.dividerStyle : {}"
                            >
                                <span v-if="field.type === 'DIVIDER'" />
                                <span v-else
                                      :class="{'td-contents': true, 'data-field': field.type === 'DATA'}"
                                >
                                    {{ item[field.name] ?? '-' }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-overlay-preview-table {
    @apply bg-white;
    height: 100%;
    overflow-y: scroll;
    .table-container {
        @apply overflow-auto h-full w-full;

        .preview-toolbox {
            padding-top: 1rem;
        }

        table {
            @apply min-w-full;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
        }
        thead {
            tr {
                position: sticky;
                top: 0;
                z-index: 1;
            }
        }
        th {
            @apply text-label-md font-bold border-t border-b border-gray-900;
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
            padding-left: 1rem;
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
            .no-data-wrapper {
                position: absolute;
                width: 100%;
                height: calc(100% - 2rem);
                max-height: 12.875rem;
            }
        }
        td {
            @apply px-4 z-0 align-middle min-w-28 text-sm border-b;
            min-width: 8rem;

            &:hover {
                @apply bg-gray-200;
            }

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
}
</style>
