<script lang="ts" setup>
import {
    computed, onUnmounted, reactive, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { isEmpty } from 'lodash';

import {
    PDivider,
} from '@cloudforet/mirinae';

import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';

import { queryStringToArray, queryStringToObject, queryStringToString } from '@/lib/router-query-string';

import { useBreadcrumbs } from '@/common/composables/breadcrumbs';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import MetricExplorerChart from '@/services/asset-inventory/components/MetricExplorerChart.vue';
import MetricExplorerDataTable from '@/services/asset-inventory/components/MetricExplorerDataTable.vue';
import MetricExplorerGroupBy from '@/services/asset-inventory/components/MetricExplorerGroupBy.vue';
import MetricExplorerHeader from '@/services/asset-inventory/components/MetricExplorerHeader.vue';
import MetricExplorerQuerySection from '@/services/asset-inventory/components/MetricExplorerQuerySection.vue';
import { useMetricExampleGetQuery } from '@/services/asset-inventory/composables/use-metric-example-get-query';
import { useMetricGetQuery } from '@/services/asset-inventory/composables/use-metric-get-query';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { useMetricExplorerPageStore } from '@/services/asset-inventory/stores/metric-explorer-page-store';
import type { Granularity } from '@/services/asset-inventory/types/asset-analysis-type';
import type { MetricExplorerPageUrlQuery } from '@/services/asset-inventory/types/metric-explorer-url-query-type';


const gnbStore = useGnbStore();
const { breadcrumbs } = useBreadcrumbs();
const route = useRoute();
const router = useRouter();

const metricExplorerPageStore = useMetricExplorerPageStore();

const referenceMap = useAllReferenceDataModel();

const state = reactive({
    currentMetricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
    breadCrumbs: computed(() => {
        const targetNamespace = referenceMap.namespace[currentMetric.value?.namespace_id || ''];
        const _targetMetric = currentMetric.value;
        return [
            ...(breadcrumbs.value.slice(0, breadcrumbs.value.length - 1)),
            {
                name: `[${targetNamespace?.name || currentMetric.value?.namespace_id}] ${currentMetricExample.value?.name ?? _targetMetric?.name}`,
                path: state.currentMetricExampleId ? ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME : ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
            },
        ];
    }),
    metricFavoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.METRIC,
        id: currentMetric.value?.metric_id,
    })),
    metricExampleFavoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.METRIC_EXAMPLE,
        id: route.params.metricExampleId,
    })),
});
const defaultMetricGroupByList = computed<string[]>(() => {
    const defaultLabelKeys = currentMetric.value?.labels_info?.filter((d) => d.default) ?? [];
    return defaultLabelKeys.map((d) => d.key);
});

/* Util */
const setQueryOptions = (urlQuery: MetricExplorerPageUrlQuery) => {
    const _granularity = queryStringToString(urlQuery.granularity);
    const _groupBy = queryStringToArray(urlQuery.group_by);
    const _period = queryStringToObject(urlQuery.period);
    const _filters = queryStringToObject(urlQuery.filters);

    if (_granularity) metricExplorerPageStore.setGranularity(_granularity as Granularity);
    metricExplorerPageStore.setSelectedGroupByList(_groupBy || []);
    if (!isEmpty(_period)) {
        metricExplorerPageStore.setRelativePeriod(undefined);
        metricExplorerPageStore.setPeriod(_period);
    }
    if (!isEmpty(_filters)) metricExplorerPageStore.setFilters(_filters);
    metricExplorerPageStore.setRefreshMetricPeriodDropdown(true);
};

/* Query */
const { data: currentMetric, isLoading: currentMetricLoading } = useMetricGetQuery({
    metricId: computed(() => route.params.metricId),
});
const { data: currentMetricExample, isLoading: currentMetricExampleLoading } = useMetricExampleGetQuery({
    metricExampleId: computed(() => route.params.metricExampleId),
});

watch([() => route.params, () => currentMetricLoading.value, () => currentMetricExampleLoading.value], async ([params, _currentMetricLoading, _currentMetricExampleLoading]) => {
    if (!params.metricId || _currentMetricLoading || _currentMetricExampleLoading) return;
    metricExplorerPageStore.reset();
    if (params.metricExampleId) {
        metricExplorerPageStore.initMetricExampleOptions(currentMetricExample.value);
    } else if (defaultMetricGroupByList.value.length) {
        metricExplorerPageStore.setSelectedGroupByList(defaultMetricGroupByList.value);
    }

    // case for Home landing page
    if (params.groupBy && currentMetric.value?.labels_info?.find((d) => d.key === 'labels.Provider')) {
        const defaultFilters = { 'labels.Provider': [params.groupBy] };
        if (params.group) defaultFilters['labels.Cloud Service Group'] = [params.group];
        if (params.type) defaultFilters['labels.Cloud Service Type'] = [params.type];
        metricExplorerPageStore.setFilters(defaultFilters);
    }

    // set query options from url query
    const currentQuery = router.currentRoute.query;
    if (!isEmpty(currentQuery)) setQueryOptions(currentQuery);

    metricExplorerPageStore.setMetricInitiated(true);
    gnbStore.setBreadcrumbs(state.breadCrumbs);
}, { immediate: true });

watch([
    () => state.metricFavoriteOptions,
    () => state.metricExampleFavoriteOptions,
], ([metricFavoriteOptions, metricExampleFavoriteOptions]) => {
    if (route.name === ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME) gnbStore.setFavoriteItemId(metricFavoriteOptions);
    if (route.name === ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL.EXAMPLE._NAME) gnbStore.setFavoriteItemId(metricExampleFavoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    gnbStore.setBreadcrumbs([]);
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
