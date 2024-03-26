import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';
import type { MetricGetParameters } from '@/schema/inventory/metric/api-verbs/get';
import type { MetricModel } from '@/schema/inventory/metric/model';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import type {
    Granularity, MetricNamespace, Period, RelativePeriod,
} from '@/services/asset-inventory/types/metric-explorer-type';


export const useMetricExplorerPageStore = defineStore('metric-explorer-page', () => {
    const state = reactive({
        loading: false,
        metricLoading: false,
        metricId: undefined as string|undefined,
        metric: undefined as MetricModel|undefined,
        granularity: GRANULARITY.MONTHLY as Granularity,
        period: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[0] as Period|undefined,
        relativePeriod: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[1] as RelativePeriod|undefined,
        enabledFiltersProperties: undefined as string[]|undefined,
        filters: {} as Record<string, string[]>,
        namespaces: [] as MetricNamespace[],
        groupByList: [] as string[],
        selectedGroupByList: [] as string[],
        selectedChartGroupBy: undefined as string|undefined,
        selectedNamespace: undefined as MetricNamespace|undefined,
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
    const setGroupByList = (groupByList: string[]) => {
        state.groupByList = groupByList;
    };
    const setEnabledFiltersProperties = (enabledProperties: string[]) => {
        state.enabledFiltersProperties = enabledProperties;
    };
    const setFilters = (filters: Record<string, string[]>) => {
        state.filters = filters;
    };
    const setMetric = (metric?: MetricModel) => {
        state.metric = metric;
    };

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
        state.groupByList = [];
        state.selectedGroupByList = [];
        state.selectedChartGroupBy = undefined;
        state.selectedNamespace = undefined;
        state.enabledFiltersProperties = undefined;
    };
    const loadNamespaces = async () => {
        state.loading = true;
        const fetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.cloudService.analyze);
        try {
            const { response, status } = await fetcher<CloudServiceAnalyzeParameters, ListResponse<MetricNamespace>>({
                query: {
                    group_by: ['cloud_service_group', 'provider', 'cloud_service_type'],
                    fields: {},
                    filter: [{ k: 'state', v: ['ACTIVE'], o: 'in' }],
                    filter_or: [],
                    sort: [{ key: 'provider', desc: false }, { key: 'cloud_service_group', desc: false }, { key: 'cloud_service_type', desc: false }],
                },
            });
            if (status === 'succeed') {
                state.namespaces = response.results ?? [];
            }
        } catch (e) {
            console.error(e);
        } finally {
            state.loading = false;
        }
    };
    const fetchMetric = async () => {
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
        fetchMetric,
    };
    const mutations = {
        setGranularity,
        setPeriod,
        setRelativePeriod,
        setSelectedGroupByList,
        setSelectedChartGroupBy,
        setEnabledFiltersProperties,
        setFilters,
        setGroupByList,
        setMetric,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
