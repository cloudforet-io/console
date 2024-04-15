<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PDivider,
} from '@spaceone/design-system';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import MetricExplorerChart from '@/services/asset-inventory/components/MetricExplorerChart.vue';
import MetricExplorerDataTable from '@/services/asset-inventory/components/MetricExplorerDataTable.vue';
import MetricExplorerGroupBy from '@/services/asset-inventory/components/MetricExplorerGroupBy.vue';
import MetricExplorerHeader from '@/services/asset-inventory/components/MetricExplorerHeader.vue';
import MetricExplorerQuerySection from '@/services/asset-inventory/components/MetricExplorerQuerySection.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


interface Props {
    id: string;
}
const props = withDefaults(defineProps<Props>(), {
    id: '',
});

const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();

const metricExplorerPageStore = useMetricExplorerPageStore();

const state = reactive({
    breadCrumbs: computed(() => [
        ...(breadcrumbs.value.slice(0, breadcrumbs.value.length - 1)),
        {
            name: (`[${metricExplorerPageStore.state.selectedNamespace?.name}] ${metricExplorerPageStore.state.metric?.name}`) ?? props.id,
            path: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
        },
    ]),
});

watch(() => props.id, async (metricId) => {
    if (metricId) {
        metricExplorerPageStore.setMetricId(metricId);
        await metricExplorerPageStore.loadMetric();
    } else {
        metricExplorerPageStore.setMetricId();
    }
    gnbStore.setBreadcrumbs(state.breadCrumbs);
}, { immediate: true });

watch(() => metricExplorerPageStore.state.namespaces, async (namespaces) => {
    metricExplorerPageStore.$patch((_store) => {
        const metric = _store.state.metric;
        const namespace = namespaces.find((d) => d.namespace_id === metric?.namespace_id);
        if (namespace) _store.state.selectedNamespace = namespace;
    });
    gnbStore.setBreadcrumbs(state.breadCrumbs);
});
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
