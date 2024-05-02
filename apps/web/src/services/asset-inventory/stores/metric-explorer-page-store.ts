import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { MetricExampleListParameters } from '@/schema/inventory/metric-example/api-verbs/list';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricGetParameters } from '@/schema/inventory/metric/api-verbs/get';
import type { MetricModel } from '@/schema/inventory/metric/model';
import type { MetricLabelKey } from '@/schema/inventory/metric/type';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceItem, MetricReferenceMap } from '@/store/reference/metric-reference-store';
import type { ReferenceMap } from '@/store/reference/type';

import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { GRANULARITY, OPERATOR } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import type {
    Granularity, Operator, Period, RelativePeriod, QueryFormMode, MetricFilter,
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
        filters: {} as MetricFilter,
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
        refinedMetricLabelKeys: computed<MetricLabelKey[]>(() => {
            if (!state.metric?.label_keys?.length) return [];
            if (_state.isAdminMode) {
                return state.metric.label_keys;
            }
            return state.metric.label_keys.filter((d) => d.key !== 'workspace_id');
        }),
        // below is the map of reference store for each reference label key
        labelKeysReferenceMap: computed<Record<string, ReferenceMap>>(() => {
            const _labelKeysMap: Record<string, MetricLabelKey> = {}; // e.g. [{ 'Region': {...} }, { 'project_id': {...} }]
            state.metric?.label_keys.filter((d) => !isEmpty(d.reference)).forEach((d) => {
                const _fieldName = d.key.replace('labels.', '');
                _labelKeysMap[_fieldName] = d;
            });

            const _storeMap: Record<string, ReferenceMap> = {};
            Object.values(_labelKeysMap).forEach((labelKey) => {
                const _resourceType = labelKey.reference?.resource_type;
                const targetModelConfig = Object.values(MANAGED_VARIABLE_MODEL_CONFIGS)
                    .find((d) => (d.resourceType === _resourceType));
                if (targetModelConfig) {
                    const _refinedKey = labelKey.key.replace('labels.', '');
                    _storeMap[_refinedKey] = allReferenceStore.getters[targetModelConfig.key];
                }
            });
            return _storeMap; // e.g. { 'Region': {...}, 'project_id': {...} }
        }),
        consoleFilters: computed<ConsoleFilter[]>(() => {
            const results: ConsoleFilter[] = [];
            Object.entries(state.filters ?? {}).forEach(([category, filterItems]) => {
                if (filterItems.length) {
                    results.push({
                        k: category,
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

    /* Actions */
    const reset = () => {
        state.metric = undefined;
        //
        state.granularity = GRANULARITY.DAILY;
        state.period = getInitialPeriodByGranularity(GRANULARITY.DAILY)[0];
        state.relativePeriod = getInitialPeriodByGranularity(GRANULARITY.DAILY)[1];
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
    const loadMetricExamples = async (namespaceId?: string) => {
        if (!namespaceId) return;
        try {
            const res = await SpaceConnector.clientV2.inventory.metricExample.list<MetricExampleListParameters, ListResponse<MetricExampleModel>>({
                query: {
                    filter: [
                        {
                            k: 'namespace_id',
                            v: namespaceId,
                            o: 'eq',
                        },
                    ],
                },
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
