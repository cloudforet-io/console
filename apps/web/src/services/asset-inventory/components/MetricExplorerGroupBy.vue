<script lang="ts" setup>
import { computed, reactive } from 'vue';

import {
    PSelectButton,
} from '@spaceone/design-system';
import { xor } from 'lodash';

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
            <p class="count-text">
                <span class="selected-group-by-items-count"
                      :class="{ 'selected': metricExplorerPageState.selectedGroupByList.length > 0 }"
                >{{ metricExplorerPageState.selectedGroupByList.length }}</span>
                <span>/3</span>
            </p>
            <p-select-button v-for="item in state.groupByItems"
                             :key="item.name"
                             :value="item.name"
                             :selected="metricExplorerPageState.selectedGroupByList"
                             use-fixed-menu-style
                             multi-selectable
                             size="sm"
                             @change="handleChangeDefaultGroupBy"
            >
                {{ item.label }}
            </p-select-button>
        </div>
        <div class="right-part">
            <strong>{{ $t('INVENTORY.METRIC_EXPLORER.UNIT') }}:</strong>
            <span class="ml-1">{{ metricExplorerPageState.metric?.unit || '--' }}</span>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-group-by {
    @apply flex flex-wrap justify-between;
    column-gap: 0.375rem;
    row-gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    padding: 1rem 0;

    .left-part {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .count-text {
        @apply text-label-lg text-gray-500;
        .selected-group-by-items-count {
            &.selected {
                @apply text-gray-900;
            }
        }
    }
}
</style>
