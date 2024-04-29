import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { MetricExampleListParameters } from '@/schema/inventory/metric-example/api-verbs/list';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricGetParameters } from '@/schema/inventory/metric/api-verbs/get';
import type { MetricModel } from '@/schema/inventory/metric/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceItem, MetricReferenceMap } from '@/store/reference/metric-reference-store';

import { GRANULARITY, OPERATOR } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getRefinedMetricDataAnalyzeQueryGroupBy } from '@/services/asset-inventory/helpers/metric-explorer-data-helper';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import type {
    Granularity, Operator, Period, RelativePeriod,
    StaticGroupBy,
    QueryFormMode,
} from '@/services/asset-inventory/types/metric-explorer-type';


export const useMetricExplorerPageStore = defineStore('page-metric-explorer', () => {
    const route = useRoute();
    const appContextStore = useAppContextStore();
    const allReferenceStore = useAllReferenceStore();
    const _state = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
    });
    const state = reactive({
        metricLoading: false,
        refreshMetricData: false,
        metric: undefined as MetricModel|undefined,
        metricExamples: [] as MetricExampleModel[],
        // query section
        granularity: GRANULARITY.DAILY as Granularity,
        period: getInitialPeriodByGranularity(GRANULARITY.DAILY)[0] as Period|undefined,
        relativePeriod: getInitialPeriodByGranularity(GRANULARITY.DAILY)[1] as RelativePeriod|undefined,
        filters: {} as Record<string, string[]>,
        selectedGroupByList: [] as string[],
        selectedChartGroupBy: undefined as string|undefined,
        selectedOperator: OPERATOR.SUM as Operator,
        // query form sidebar
        metricQueryFormMode: 'CREATE' as QueryFormMode,
        showMetricQueryFormSidebar: false,
    });
    const getters = reactive({
        metricId: computed<string|undefined>(() => route.params.metricId),
        metricExampleId: computed<string|undefined>(() => route.params.metricExampleId),
        namespaceId: computed<string|undefined>(() => state.metric?.namespace_id),
        metrics: computed<MetricReferenceItem[]>(() => Object.values(_state.metrics).filter((metric) => metric.data.namespace_id === getters.namespaceId)),
        metricExample: computed<MetricExampleModel|undefined>(() => state.metricExamples.find((d) => d.example_id === getters.metricExampleId)),
        groupByItems: computed<Array<{name: string, label: string}>>(() => {
            if (!state.metric?.label_keys?.length) return [];
            const staticFields: StaticGroupBy[] = ['project_id'];
            if (_state.isAdminMode) staticFields.push('workspace_id');

            const labelFields: string[] = state.metric?.label_keys || [];
            return [...staticFields, ...labelFields].map((d) => ({
                name: d, label: d,
            }));
        }),
        selectedGroupByItems: computed<Array<{name: string, label: string}>>(() => getters.groupByItems.filter((d) => state.selectedGroupByList.includes(d.name))),
        consoleFilters: computed<ConsoleFilter[]>(() => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([category, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: getRefinedMetricDataAnalyzeQueryGroupBy(category),
                        v: filterItems,
                        o: '=',
                    });
                }
            });
            return results;
        }),
        isManagedMetric: computed<boolean>(() => (state.metric?.is_managed && !getters.metricExampleId) || false),
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
    const setFilters = (filters: Record<string, string[]>) => {
        state.filters = filters;
    };
    const setSelectedOperator = (operator: Operator) => {
        state.selectedOperator = operator;
    };
    const setRefreshMetricData = (refreshMetricData: boolean) => {
        state.refreshMetricData = refreshMetricData;
    };
    const setShowMetricQueryFormSidebar = (showMetricQueryFormSidebar: boolean) => {
        state.showMetricQueryFormSidebar = showMetricQueryFormSidebar;
    };

    /* Actions */
    const reset = () => {
        state.metric = undefined;
        //
        state.granularity = GRANULARITY.MONTHLY;
        state.period = getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[0];
        state.relativePeriod = getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[1];
        state.filters = {};
        state.selectedGroupByList = [];
        state.selectedChartGroupBy = undefined;
        state.selectedOperator = OPERATOR.SUM;
    };
    const loadMetricFetcher = getCancellableFetcher(SpaceConnector.clientV2.inventory.metric.get);
    const loadMetric = async (metricId: string) => {
        state.metricLoading = true;
        try {
            const { status, response } = await loadMetricFetcher<MetricGetParameters, MetricModel>({
                metric_id: metricId,
            });
            if (status === 'succeed') {
                state.metric = response;
                state.metricLoading = false;
            }
        } catch (e) {
            state.metric = undefined;
            state.metricLoading = false;
            console.error(e);
        }
    };
    const loadMetricExamples = async (metricId?: string) => {
        try {
            const res = await SpaceConnector.clientV2.inventory.metricExample.list<MetricExampleListParameters, ListResponse<MetricExampleModel>>({
                metric_id: metricId,
            });
            state.metricExamples = res.results || [];
        } catch (e) {
            state.metricExamples = [];
            console.error(e);
        }
    };
    const openMetricQueryFormSidebar = (mode: QueryFormMode) => {
        state.metricQueryFormMode = mode;
        state.showMetricQueryFormSidebar = true;
    };

    const actions = {
        reset,
        loadMetric,
        loadMetricExamples,
        openMetricQueryFormSidebar,
    };
    const mutations = {
        setGranularity,
        setPeriod,
        setRelativePeriod,
        setSelectedGroupByList,
        setSelectedChartGroupBy,
        setFilters,
        setSelectedOperator,
        setRefreshMetricData,
        setShowMetricQueryFormSidebar,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
