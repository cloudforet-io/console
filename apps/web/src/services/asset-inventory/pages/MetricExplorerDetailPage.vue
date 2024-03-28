<script lang="ts" setup>
import { watch } from 'vue';

import {
    PDivider,
} from '@spaceone/design-system';

import MetricExplorerChart from '@/services/asset-inventory/components/MetricExplorerChart.vue';
import MetricExplorerDataTable from '@/services/asset-inventory/components/MetricExplorerDataTable.vue';
import MetricExplorerGroupBy from '@/services/asset-inventory/components/MetricExplorerGroupBy.vue';
import MetricExplorerHeader from '@/services/asset-inventory/components/MetricExplorerHeader.vue';
import MetricExplorerQuerySection from '@/services/asset-inventory/components/MetricExplorerQuerySection.vue';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


interface Props {
    id: string;
}
const props = withDefaults(defineProps<Props>(), {
    id: '',
});

const metricExplorerPageStore = useMetricExplorerPageStore();

watch(() => props.id, (metricId) => {
    if (metricId) {
        metricExplorerPageStore.setMetricId(metricId);
        metricExplorerPageStore.loadMetric();
    } else {
        metricExplorerPageStore.setMetricId();
    }
}, { immediate: true });
</script>

<template>
    <div class="metric-explorer-content">
        <metric-explorer-header />
        <p-divider />
        <div class="content-wrapper">
            <div class="overflow-wrapper">
                <metric-explorer-query-section />
                <div class="contents-wrapper">
                    <metric-explorer-group-by />
                    <metric-explorer-chart />
                    <metric-explorer-data-table />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.metric-explorer-content {
    .content-wrapper {
        overflow-x: auto;
        padding-bottom: 1.625rem;
        .overflow-wrapper {
            min-width: 50rem;
            .contents-wrapper {
                @apply bg-white rounded-md border border-gray-200;
                padding: 0 1rem 2.5rem 1rem;
            }
        }
    }
}
</style>
