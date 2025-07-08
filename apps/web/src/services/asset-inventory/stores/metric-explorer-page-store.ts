// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { cloneDeep, isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricExampleListParameters } from '@/api-clients/inventory/metric-example/schema/api-verbs/list';

import { CHART_TYPE, GRANULARITY, OPERATOR } from '@/services/asset-inventory/constants/asset-analysis-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/asset-analysis-period-helper';
import type {
    Granularity, Operator, Period, RelativePeriod, QueryFormMode, MetricFilter, ChartType,
    NamespaceSubItemType,
} from '@/services/asset-inventory/types/asset-analysis-type';

import type { MetricExampleModel } from '@/api-clients/inventory/metric-selectedGroupByListexample/schema/model';


export const useMetricExplorerPageStore = defineStore('page-metric-explorer', () => {
    const state = reactive({
        selectedNamespace: undefined as NamespaceSubItemType|undefined,
        // data
        refreshMetricData: false,
        metricExamples: [] as MetricExampleModel[],
        // query section
        granularity: GRANULARITY.DAILY as Granularity,
        period: getInitialPeriodByGranularity(GRANULARITY.DAILY)[0] as Period|undefined,
        relativePeriod: undefined as RelativePeriod|undefined,
        filters: {} as MetricFilter,
        selectedGroupByList: [] as string[],
        selectedChartGroupBy: undefined as string|undefined,
        selectedOperator: OPERATOR.SUM as Operator,
        selectedChartType: CHART_TYPE.LINE_AREA as ChartType,
        // display
        metricQueryFormMode: 'CREATE' as QueryFormMode,
        showMetricQueryFormSidebar: false,
        refreshMetricPeriodDropdown: false,
        periodText: undefined as string|undefined,
        // trigger
        metricInitiated: false,
    });
    const getters = reactive({
        consoleFilters: computed<ConsoleFilter[]>(() => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([groupBy, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: groupBy,
                        v: filterItems,
                        o: '=',
                    });
                }
            });
            return results;
        }),
        isRealtimeChart: computed<boolean>(() => ![CHART_TYPE.LINE, CHART_TYPE.LINE_AREA].includes(state.selectedChartType)),
    });

    /* Mutations */
    const setSelectedNamespace = (namespace?: NamespaceSubItemType) => {
        state.selectedNamespace = namespace;
    };
    const setSelectedChartType = (chartType: ChartType) => {
        state.selectedChartType = chartType;
    };
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
    const setMetricInitiated = (initiated: boolean) => {
        state.metricInitiated = initiated;
    };
    const setFilters = (filters: MetricFilter) => {
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
    const setRefreshMetricPeriodDropdown = (refresh: boolean) => {
        state.refreshMetricPeriodDropdown = refresh;
    };
    const setPeriodText = (periodText: string) => {
        state.periodText = periodText;
    };

    /* Actions */
    const reset = () => {
        state.refreshMetricPeriodDropdown = false;
        state.metricInitiated = false;
        //
        state.granularity = GRANULARITY.DAILY;
        state.period = getInitialPeriodByGranularity(GRANULARITY.DAILY)[0];
        state.relativePeriod = getInitialPeriodByGranularity(GRANULARITY.DAILY)[1];
        state.filters = {};
        state.selectedGroupByList = [];
        state.selectedChartGroupBy = undefined;
        state.selectedOperator = OPERATOR.SUM;
        state.refreshMetricPeriodDropdown = true;
    };
    const initMetricExampleOptions = (metricExample?: MetricExampleModel) => {
        const _options: any = metricExample?.options ?? {};
        if (!metricExample || isEmpty(_options)) return;

        if (_options?.granularity) state.granularity = _options?.granularity;
        if (_options?.period) state.period = _options?.period;
        if (_options?.relative_period) {
            state.relativePeriod = _options?.relative_period;
        } else state.relativePeriod = undefined;
        if (_options?.group_by) state.selectedGroupByList = _options?.group_by;
        if (_options?.filters) state.filters = cloneDeep(metricExample?.options?.filters);
        if (_options?.operator) state.selectedOperator = _options?.operator;
        state.refreshMetricPeriodDropdown = true;
    };
    const loadMetricExamples = async (namespaceId?: string) => {
        if (!namespaceId) return;
        try {
            const res = await SpaceConnector.clientV2.inventory.metricExample.list<MetricExampleListParameters, ListResponse<MetricExampleModel>>({
                namespace_id: namespaceId,
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
        loadMetricExamples,
        openMetricQueryFormSidebar,
        initMetricExampleOptions,
    };
    const mutations = {
        setSelectedNamespace,
        setGranularity,
        setPeriod,
        setRelativePeriod,
        setSelectedGroupByList,
        setSelectedChartGroupBy,
        setFilters,
        setSelectedOperator,
        setRefreshMetricData,
        setShowMetricQueryFormSidebar,
        setRefreshMetricPeriodDropdown,
        setSelectedChartType,
        setPeriodText,
        setMetricInitiated,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
