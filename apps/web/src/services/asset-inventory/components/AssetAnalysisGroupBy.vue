<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectButton,
} from '@spaceone/design-system';
import { xor } from 'lodash';

import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;

const state = reactive({
    groupByItems: computed(() => assetAnalysisPageGetters.refinedMetricLabelKeys.map((d) => ({
        name: d.key,
        label: d.name,
    }))),
});
/* Event */
const handleChangeDefaultGroupBy = async (selectedItems: string[], isSelected: boolean) => {
    if (isSelected) {
        const addedGroupByName: string = xor(assetAnalysisPageState.selectedGroupByList, selectedItems)[0];
        assetAnalysisPageStore.setSelectedGroupByList([addedGroupByName, ...assetAnalysisPageState.selectedGroupByList]);
        assetAnalysisPageStore.setSelectedChartGroupBy(addedGroupByName);
    } else {
        assetAnalysisPageStore.setSelectedGroupByList(selectedItems);
    }
};
</script>

<template>
    <div class="asset-analysis-group-by">
        <div class="left-part">
            <b class="label">{{ $t('INVENTORY.ASSET_ANALYSIS.GROUP_BY') }}:</b>
            <p-select-button v-for="item in state.groupByItems"
                             :key="item.name"
                             :value="item.name"
                             :selected="assetAnalysisPageState.selectedGroupByList"
                             use-fixed-menu-style
                             multi-selectable
                             size="sm"
                             class="group-by-button"
                             @change="handleChangeDefaultGroupBy"
            >
                {{ item.label }}
            </p-select-button>
        </div>
        <div v-if="!assetAnalysisPageState.metricLoading"
             class="right-part"
        >
            <strong>{{ $t('INVENTORY.ASSET_ANALYSIS.UNIT') }}:</strong>
            <span class="ml-1">{{ assetAnalysisPageState.metric?.unit || '--' }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-group-by {
    @apply flex flex-wrap justify-between;
    column-gap: 0.375rem;
    min-height: 3.625rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1.25rem 0;

    .left-part {
        .group-by-button {
            margin: 0.125rem 0 0.125rem 0.5rem;
        }
    }
}
</style>
