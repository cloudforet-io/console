<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';


import {
    PIconButton, PI, PButton,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/src/inputs/dropdown/select-dropdown/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';
import type { MetricReferenceMap } from '@/store/reference/metric-reference-store';


import WidgetFormDataTableCardAddForm from '@/common/modules/widgets/_components/WidgetFormDataTableCardAddForm.vue';
import WidgetFormDataTableCardSourceForm
    from '@/common/modules/widgets/_components/WidgetFormDataTableCardSourceForm.vue';
import { DATA_SOURCE_DOMAIN } from '@/common/modules/widgets/_constants/data-table-constant';
import { useWidgetGenerateStore } from '@/common/modules/widgets/_store/widget-generate-store';
import type { AdditionalLabel } from '@/common/modules/widgets/types/widget-data-table-type';
import type { DataTableModel } from '@/common/modules/widgets/types/widget-model';

import { gray, violet } from '@/styles/colors';

interface Props {
    item: DataTableModel;
}

const props = defineProps<Props>();
const widgetGenerateStore = useWidgetGenerateStore();
const widgetGenerateState = widgetGenerateStore.state;
const allReferenceStore = useAllReferenceStore();

const storeState = reactive({
    costDataSources: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
});

const state = reactive({
    selected: computed(() => widgetGenerateState.selectedDataTableId === props.item.data_table_id),
    sourceType: computed(() => props.item.source_type),
    options: computed(() => props.item.options),
    dataSourceId: computed(() => state.options[state.sourceType].data_source_id), // COST only
    metricId: computed(() => state.options[state.sourceType].metric_id), // ASSET only
    namespaceId: computed(() => storeState.metrics[state.metricId]?.data.namespace_id || ''), // ASSET only
    selectedSourceEndItem: props.item.source_type === DATA_SOURCE_DOMAIN.COST
        ? props.item.options[DATA_SOURCE_DOMAIN.COST]?.data_key
        : props.item.options[DATA_SOURCE_DOMAIN.ASSET]?.metric_id,
    selectedGroupByItems: [] as any[],
    filters: {} as Record<string, string[]>,
    dataFieldName: '',
    selectableSourceItems: computed<SelectDropdownMenuItem[]>(() => {
        if (state.sourceType === DATA_SOURCE_DOMAIN.COST) {
            return state.costDataTypeItems;
        }
        if (state.sourceType === DATA_SOURCE_DOMAIN.ASSET) {
            return Object.values(storeState.metrics)
                .filter((metric) => metric.data.namespace_id === state.namespaceId)
                .map((metric) => ({
                    label: metric.label,
                    name: metric.key,
                }));
        }
        return [];
    }),
    costDataTypeItems: computed(() => {
        const targetCostDataSource = storeState.costDataSources[state.dataSourceId];
        const costAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.cost;
        const usageAlias: string|undefined = targetCostDataSource?.data?.plugin_info?.metadata?.alias?.usage;
        const additionalMenuItems: MenuItem[] = targetCostDataSource.data?.cost_data_keys?.map((key) => ({
            name: key, label: key,
        }));
        return [
            { name: 'cost', label: costAlias ? `Cost (${costAlias})` : 'Cost' },
            { name: 'usage', label: usageAlias ? `Usage (${usageAlias})` : 'Usage' },
            ...(additionalMenuItems || []),
        ];
    }),
});

const advancedOptionsState = reactive({
    additionalLabels: [] as AdditionalLabel[],
    separateDate: false,
    selectedTimeDiff: 'none',
    selectedTimeDiffDate: undefined as string|undefined,
});



/* Events */
const handleSelectDataTable = async (dataTableId: string) => {
    widgetGenerateStore.setSelectedDataTableId(dataTableId);
    await widgetGenerateStore.loadDataTable(dataTableId);
};

const handleSelectSourceItem = (selectedItem: string) => {
    state.selectedSourceEndItem = selectedItem;
};

onMounted(() => {
    state.selectedGroupByItems = [...(props.item.options?.group_by || [])];
    state.dataFieldName = state.selectableSourceItems.find((source) => source.name === state.selectedSourceEndItem)?.label;
});

watch(() => state.selectedSourceEndItem, (_selectedSourceItem) => {
    // Base Options
    state.selectedGroupByItems = [];
    state.dataFieldName = state.selectableSourceItems.find((source) => source.name === _selectedSourceItem)?.label;
    state.filters = {};


    // Advanced Options
    advancedOptionsState.additionalLabels = [];
    advancedOptionsState.separateDate = false;
    advancedOptionsState.selectedTimeDiff = 'none';
});

</script>

<template>
    <div class="widget-form-data-table-card">
        <div class="card-wrapper"
             :class="{ 'selected': state.selected }"
        >
            <div class="card-header">
                <div class="title-wrapper">
                    <button class="selected-radio-icon"
                            @click="handleSelectDataTable(props.item.data_table_id)"
                    >
                        <p-i :name="state.selected ? 'ic_checkbox-circle-selected' : 'ic_radio'"
                             :color="state.selected ? violet[500] : gray[400]"
                             size="md"
                        />
                    </button>
                    <p>Data Source 1</p>
                    <p-icon-button class="edit-button"
                                   style-type="transparent"
                                   name="ic_edit-text"
                                   size="sm"
                    />
                </div>
                <widget-form-data-table-card-source-form :source-type="state.sourceType"
                                                         :parent-source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.namespaceId"
                                                         :menu="state.selectableSourceItems"
                                                         :selected="state.selectedSourceEndItem"
                                                         @select="handleSelectSourceItem"
                />
            </div>
            <widget-form-data-table-card-add-form :source-id="state.sourceType === DATA_SOURCE_DOMAIN.COST ? state.dataSourceId : state.selectedSourceEndItem"
                                                  :source-key="state.selectedSourceEndItem"
                                                  :source-type="state.sourceType"
                                                  :selected-group-by-items.sync="state.selectedGroupByItems"
                                                  :filters.sync="state.filters"
                                                  :data-field-name.sync="state.dataFieldName"
                                                  :additional-labels.sync="advancedOptionsState.additionalLabels"
                                                  :separate-date.sync="advancedOptionsState.separateDate"
                                                  :selected-time-diff.sync="advancedOptionsState.selectedTimeDiff"
                                                  :selected-time-diff-date.sync="advancedOptionsState.selectedTimeDiffDate"
            />
            <div class="button-group-wrapper">
                <p-button style-type="tertiary"
                          icon-left="ic_delete"
                >
                    Delete
                </p-button>
                <div class="form-button-wrapper">
                    <p-button style-type="transparent"
                              icon-left="ic_refresh"
                    >
                        Reset
                    </p-button>
                    <p-button style-type="secondary">
                        Apply
                    </p-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.widget-form-data-table-card {
    @apply relative;
    height: auto;

    .card-wrapper {
        @apply relative border border-gray-300 rounded-lg w-full bg-white;
        width: 24rem;
        overflow: hidden;
        height: auto;

        &.selected {
            @apply border-violet-600;
            box-shadow: 0 0 0 0.1875rem rgba(137, 124, 214, 0.6);
        }

        .card-header {
            @apply bg-gray-100;
            padding: 0.5rem 0.75rem;

            .title-wrapper {
                @apply flex items-center text-paragraph-sm font-bold;
                gap: 0.125rem;
                margin-bottom: 0.5rem;
                .selected-radio-icon {
                    width: 1.5rem;
                    height: 1.5rem;
                }
            }
        }

        .button-group-wrapper {
            @apply border-t border-gray-200 flex justify-between;
            padding: 0.75rem 1rem;

            .form-button-wrapper {
                @apply flex gap-2;
            }
        }
    }
}
</style>
