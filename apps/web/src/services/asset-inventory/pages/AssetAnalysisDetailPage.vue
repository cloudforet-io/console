<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PDivider,
} from '@spaceone/design-system';

import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { NamespaceReferenceMap } from '@/store/reference/namespace-reference-store';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import AssetAnalysisChart from '@/services/asset-inventory/components/AssetAnalysisChart.vue';
import AssetAnalysisDataTable from '@/services/asset-inventory/components/AssetAnalysisDataTable.vue';
import AssetAnalysisGroupBy from '@/services/asset-inventory/components/AssetAnalysisGroupBy.vue';
import AssetAnalysisHeader from '@/services/asset-inventory/components/AssetAnalysisHeader.vue';
import AssetAnalysisQuerySection from '@/services/asset-inventory/components/AssetAnalysisQuerySection.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useAssetAnalysisPageStore } from '@/services/asset-inventory/stores/asset-analysis-page-store';


const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();
const route = useRoute();

const allReferenceStore = useAllReferenceStore();
const assetAnalysisPageStore = useAssetAnalysisPageStore();
const assetAnalysisPageState = assetAnalysisPageStore.state;
const assetAnalysisPageGetters = assetAnalysisPageStore.getters;

const storeState = reactive({
    namespaces: computed<NamespaceReferenceMap>(() => allReferenceStore.getters.namespace),
});
const state = reactive({
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    currentMetricExample: computed<MetricExampleModel|undefined>(() => assetAnalysisPageState.metricExamples.find((d) => d.example_id === state.currentMetricExampleId)),
    breadCrumbs: computed(() => {
        const targetNamespace = storeState.namespaces[assetAnalysisPageGetters.namespaceId];
        const _targetMetric = assetAnalysisPageState.metric;
        return [
            ...(breadcrumbs.value.slice(0, breadcrumbs.value.length - 1)),
            {
                name: `[${targetNamespace?.name}] ${state.currentMetricExample?.name ?? _targetMetric?.name}`,
                path: state.currentMetricExampleId ? ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL.EXAMPLE._NAME : ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME,
            },
        ];
    }),
    metricFavoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.METRIC,
        id: assetAnalysisPageState.metric?.metric_id,
    })),
    metricExampleFavoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.METRIC_EXAMPLE,
        id: route.params.metricExampleId,
    })),
});


watch(() => route.params, async (params) => {
    if (!params.metricId) return;
    assetAnalysisPageStore.reset();
    await assetAnalysisPageStore.loadMetric(params.metricId);
    if (params.metricExampleId) {
        await assetAnalysisPageStore.loadMetricExamples(assetAnalysisPageGetters.namespaceId);
        const targetMetricExample = assetAnalysisPageState.metricExamples.find((d) => d.example_id === params.metricExampleId);
        assetAnalysisPageStore.initMetricExampleOptions(targetMetricExample);
    } else if (assetAnalysisPageGetters.defaultMetricGroupByList) {
        assetAnalysisPageStore.setSelectedGroupByList(assetAnalysisPageGetters.defaultMetricGroupByList);
    }

    gnbStore.setBreadcrumbs(state.breadCrumbs);
}, { immediate: true });

watch([
    () => state.metricFavoriteOptions,
    () => state.metricExampleFavoriteOptions,
], ([metricFavoriteOptions, metricExampleFavoriteOptions]) => {
    if (route.name === ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL._NAME) gnbStore.setFavoriteItemId(metricFavoriteOptions);
    if (route.name === ASSET_INVENTORY_ROUTE.ASSET_ANALYSIS.DETAIL.EXAMPLE._NAME) gnbStore.setFavoriteItemId(metricExampleFavoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
});
</script>

<template>
    <div class="asset-analysis-content">
        <asset-analysis-header />
        <p-divider />
        <div class="content-wrapper">
            <div class="overflow-wrapper">
                <asset-analysis-query-section />
                <div class="contents-wrapper">
                    <asset-analysis-group-by />
                    <asset-analysis-chart />
                    <asset-analysis-data-table />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.asset-analysis-content {
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
