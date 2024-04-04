<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PSelectDropdown } from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type {
    CostDataSourceReferenceMap,
    CostDataSourceItems,
} from '@/store/reference/cost-data-source-reference-store';

import { useCostAnalysisPageStore } from '@/services/cost-explorer/stores/cost-analysis-page-store';
import type { DisplayDataType } from '@/services/cost-explorer/types/cost-explorer-query-type';


interface MenuItem extends SelectDropdownMenuItem {
    name: DisplayDataType;
}

const allReferenceStore = useAllReferenceStore();
const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.state;
const costAnalysisPageGetters = costAnalysisPageStore.getters;

const storeState = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    targetCostDataSource: computed<CostDataSourceItems|undefined>(() => {
        if (!costAnalysisPageGetters.selectedDataSourceId) return undefined;
        return storeState.costDataSource[costAnalysisPageGetters.selectedDataSourceId];
    }),
    additionalMenuItems: computed<MenuItem[]>(() => {
        if (state.targetCostDataSource) {
            return (state.targetCostDataSource.data?.cost_data_keys ?? []).map((key) => ({
                type: 'item',
                name: key,
                label: key,
            }));
        } return [];
    }),
    headerMenuItems: computed<MenuItem[]>(() => [
        { type: 'item', name: 'cost', label: 'Cost' },
        { type: 'item', name: 'usage', label: 'Usage' },
        ...state.additionalMenuItems,
    ]),
});

const handleUpdateSelected = (selected: DisplayDataType) => {
    costAnalysisPageStore.setDisplayDataType(selected);
};
</script>

<template>
    <p-select-dropdown :selected="costAnalysisPageState.displayDataType"
                       :menu="state.headerMenuItems"
                       :selection-label="$t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.DATA_TYPE')"
                       style-type="rounded"
                       @update:selected="handleUpdateSelected"
    />
</template>
