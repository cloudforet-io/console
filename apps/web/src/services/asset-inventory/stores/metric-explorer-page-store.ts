import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import { getInitialPeriodByGranularity } from '@/services/asset-inventory/helpers/metric-explorer-period-helper';
import type {
    Granularity, Period, RelativePeriod, MetricNamespace,
} from '@/services/asset-inventory/types/metric-explorer-type';



export const useMetricExplorerPageStore = defineStore('metric-explorer-page', () => {
    const state = reactive({
        loading: false,
        granularity: GRANULARITY.MONTHLY as Granularity,
        period: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[0] as Period|undefined,
        relativePeriod: getInitialPeriodByGranularity(GRANULARITY.MONTHLY)[1] as RelativePeriod|undefined,
        filters: {} as Record<string, string[]>,
        namespaces: [] as MetricNamespace[],
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

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
        state.selectedGroupByList = [];
        state.selectedChartGroupBy = undefined;
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

    const actions = {
        reset,
        loadNamespaces,
    };
    const mutations = {
        setGranularity,
        setPeriod,
        setRelativePeriod,
        setSelectedGroupByList,
        setSelectedChartGroupBy,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
