<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDivider,
} from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import MetricExplorerChart from '@/services/asset-inventory/components/MetricExplorerChart.vue';
import MetricExplorerDataTable from '@/services/asset-inventory/components/MetricExplorerDataTable.vue';
import MetricExplorerGroupBy from '@/services/asset-inventory/components/MetricExplorerGroupBy.vue';
import MetricExplorerHeader from '@/services/asset-inventory/components/MetricExplorerHeader.vue';
import MetricExplorerQuerySection from '@/services/asset-inventory/components/MetricExplorerQuerySection.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';


const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();
const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const metricExplorerPageStore = useMetricExplorerPageStore();
const metricExplorerPageState = metricExplorerPageStore.state;
const metricExplorerPageGetters = metricExplorerPageStore.getters;

const storeState = reactive({
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
});
const state = reactive({
    breadCrumbs: computed(() => {
        const targetNamespace = storeState.namespaces[metricExplorerPageGetters.namespaceId];
        const _targetMetric = metricExplorerPageState.metric;
        const _targetMetricExample = metricExplorerPageGetters.metricExample;
        return [
            ...(breadcrumbs.value.slice(0, breadcrumbs.value.length - 1)),
            {
                name: `[${targetNamespace?.name}] ${_targetMetricExample?.name ?? _targetMetric?.name}`,
                path: _targetMetricExample ? ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            },
        ];
    }),
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.METRIC,
        id: metricExplorerPageState.metric?.metric_id,
    })),
});


watch(() => route.params, async (params) => {
    if (!params.metricId) return;
    metricExplorerPageStore.reset();
    await Promise.allSettled([
        metricExplorerPageStore.loadMetric(params.metricId),
        metricExplorerPageStore.loadMetricExamples(params.metricId),
    ]);
    gnbStore.setBreadcrumbs(state.breadCrumbs);
}, { immediate: true });

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
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
