import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { MetricGetParameters } from '@/schema/inventory/metric/api-verbs/get';
import type { MetricListParameters } from '@/schema/inventory/metric/api-verbs/list';
import type { MetricModel } from '@/schema/inventory/metric/model';
import type { NamespaceGetParameters } from '@/schema/inventory/namespace/api-verbs/get';
import type { NamespaceModel } from '@/schema/inventory/namespace/model';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import type {
    Granularity, MetricNamespace, Period, RelativePeriod,
} from '@/services/asset-inventory/types/metric-explorer-type';


export const useMetricExplorerPageStore = defineStore('metric-explorer-page', () => {
    const state = reactive({
        loading: false,
        metricListLoading: false,
        metricLoading: false,
        metricId: undefined as string|undefined,
        metric: undefined as MetricModel|undefined,
        granularity: GRANULARITY.MONTHLY as Granularity,
        period: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[0] as Period|undefined,
        relativePeriod: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[1] as RelativePeriod|undefined,
        enabledFiltersProperties: undefined as string[]|undefined,
        filters: {} as Record<string, string[]>,
        namespaces: [] as NamespaceModel[],
        metricList: [] as MetricModel[],
        selectedGroupByList: [] as string[],
        selectedChartGroupBy: undefined as string|undefined,
        selectedNamespace: undefined as MetricNamespace|undefined,
    });
    const getters = reactive({
        groupByItems: computed<Array<{name: string, label: string}>>(() => {
            if (!state.metric?.label_keys?.length) return [];
            return state.metric.label_keys.map((label) => ({
                name: label.key,
                label: label.name,
            }));
        }),
        selectedGroupByItems: computed<Array<{name: string, label: string}>>(() => state.selectedGroupByList.map((groupBy) => ({
            name: groupBy,
            label: state.metric?.label_keys?.find((label) => label.key === groupBy)?.name ?? groupBy,
        }))),
    });

    /* Mutations */
    const setGranularity = (granularity: Granularity) => {
        state.granularity = granularity;
    };
    const setPeriod = (period?: Period) => {
        state.period = period;
    };
    const setRelativePeriod = (relativePeriod?: RelativePeriod) => {
        state.relativePeriod = relativePeriod;
    };
    const setSelectedGroupByList = (groupByList: string[]) => {
        state.selectedGroupByList = groupByList;
    };
    const setSelectedChartGroupBy = (groupBy: string|undefined) => {
        state.selectedChartGroupBy = groupBy;
    };
    const setEnabledFiltersProperties = (enabledProperties: string[]) => {
        state.enabledFiltersProperties = enabledProperties;
    };
    const setFilters = (filters: Record<string, string[]>) => {
        state.filters = filters;
    };
    const setMetricId = (metricId?: string) => {
        state.metricId = metricId;
    };

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
        state.selectedGroupByList = [];
        state.selectedChartGroupBy = undefined;
        state.selectedNamespace = undefined;
        state.enabledFiltersProperties = undefined;
    };
    const loadNamespaces = async () => {
        state.loading = true;
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.namespace.list);
        try {
            const { response, status } = await fetcher<NamespaceGetParameters, ListResponse<NamespaceModel>>({});
            if (status === 'succeed') {
                state.namespaces = response.results || [];
                state.loading = false;
            }
        } catch (e) {
            console.error(e);
            state.namespaces = [];
            state.loading = false;
        }
    };
    const loadMetrics = async () => {
        state.metricListLoading = true;
        try {
            const response = await SpaceConnector.clientV2.inventory.metric.list<MetricListParameters, ListResponse<MetricModel>>({
                // namespace_id: state.selectedNamespaceId,
            });
            state.metricList = response.results ?? [];
        } catch (e) {
            state.metricList = [];
            console.error(e);
        } finally {
            state.metricListLoading = false;
        }
    };
    const loadMetric = async () => {
        if (!state.metricId) return;
        state.metricLoading = true;
        try {
            state.metric = await SpaceConnector.clientV2.inventory.metric.get<MetricGetParameters, MetricModel>({
                metric_id: state.metricId,
            });
        } catch (e) {
            state.metric = undefined;
            console.error(e);
        } finally {
            state.metricLoading = false;
        }
    };

    const actions = {
        reset,
        loadNamespaces,
        loadMetrics,
        loadMetric,
    };
    const mutations = {
        setGranularity,
        setPeriod,
        setRelativePeriod,
        setSelectedGroupByList,
        setSelectedChartGroupBy,
        setEnabledFiltersProperties,
        setFilters,
        setMetricId,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
