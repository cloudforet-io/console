<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { xor } from 'lodash';

import {
    PSelectButton,
} from '@cloudforet/mirinae';

import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;

const state = reactive({
    groupByItems: computed(() => metricExplorerPageGetters.refinedMetricLabelKeys.map((d) => ({
        name: d.key,
        label: d.name,
    }))),
});
/* Event */
const handleChangeDefaultGroupBy = async (selectedItems: string[], isSelected: boolean) => {
    if (isSelected) {
        const addedGroupByName: string = xor(metricExplorerPageState.selectedGroupByList, selectedItems)[0];
        metricExplorerPageStore.setSelectedGroupByList([addedGroupByName, ...metricExplorerPageState.selectedGroupByList]);
        metricExplorerPageStore.setSelectedChartGroupBy(addedGroupByName);
    } else {
        metricExplorerPageStore.setSelectedGroupByList(selectedItems);
    }
};
</script>

<template>
    <div class="metric-explorer-group-by">
        <div class="left-part">
            <b class="label">{{ $t('INVENTORY.METRIC_EXPLORER.GROUP_BY') }}:</b>
            <p-select-button v-for="item in state.groupByItems"
                             :key="item.name"
                             :value="item.name"
                             :selected="metricExplorerPageState.selectedGroupByList"
                             use-fixed-menu-style
                             multi-selectable
                             size="sm"
                             class="group-by-button"
                             @change="handleChangeDefaultGroupBy"
            >
                {{ item.label }}
            </p-select-button>
        </div>
        <div v-if="!metricExplorerPageState.metricLoading"
             class="right-part"
        >
            <strong>{{ $t('INVENTORY.METRIC_EXPLORER.UNIT') }}:</strong>
            <span class="ml-1">{{ metricExplorerPageState.metric?.unit || '--' }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-group-by {
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
