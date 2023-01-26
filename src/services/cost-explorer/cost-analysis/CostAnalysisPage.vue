<template>
    <div class="cost-analysis-page">
        <cost-analysis-header />
        <cost-analysis-query-filter />
        <cost-analysis-group-by-filter />
        <cost-analysis-chart />
        <cost-analysis-data-table />
    </div>
</template>

<script lang="ts">
import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { Location } from 'vue-router';

import { isEqual } from 'lodash';

import { SpaceRouter } from '@/router';

import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
    queryStringToArray, queryStringToBoolean,
    queryStringToObject,
    queryStringToString,
} from '@/lib/router-query-string';

import type {
    RequestType,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import CostAnalysisChart from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisDataTable from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisDataTable.vue';
import CostAnalysisGroupByFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisHeader from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisHeader.vue';
import CostAnalysisQueryFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import type { CostAnalysisPageUrlQuery } from '@/services/cost-explorer/cost-analysis/type';
import { costExplorerStore } from '@/services/cost-explorer/store';
import type {
    CostQuerySetModel, CostQuerySetOption, Granularity,
} from '@/services/cost-explorer/type';

export interface SaveQueryEmitParam {
    updatedQuery: CostQuerySetModel;
    requestType: RequestType;
}

export default {
    name: 'CostAnalysisPage',
    components: {
        CostAnalysisHeader,
        CostAnalysisDataTable,
        CostAnalysisGroupByFilter,
        CostAnalysisChart,
        CostAnalysisQueryFilter,
    },
    props: {
        querySetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            costQueryList: computed<CostQuerySetModel[]>(() => costExplorerStore.state.costAnalysis.costQueryList),
            selectedQueryId: computed<string|undefined>(() => costExplorerStore.state.costAnalysis.selectedQueryId),
        });

        /* util */
        const setSelectedQueryId = (queryId?: string) => {
            costExplorerStore.commit('costAnalysis/setSelectedQueryId', queryId);
        };

        const setQueryOptions = (options?: CostQuerySetOption) => {
            if (options) costExplorerStore.dispatch('costAnalysis/setQueryOptions', options);
            else costExplorerStore.dispatch('costAnalysis/initCostAnalysisStoreState');
        };

        const getQueryOptionsFromUrlQuery = (urlQuery: CostAnalysisPageUrlQuery): CostQuerySetOption => ({
            granularity: queryStringToString(urlQuery.granularity) as Granularity,
            stack: queryStringToBoolean(urlQuery.stack),
            group_by: queryStringToArray(urlQuery.group_by),
            period: queryStringToObject(urlQuery.period) ?? {},
            filters: queryStringToObject(urlQuery.filters),
        });

        const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (state.costQueryList.find((item) => item.cost_query_set_id === queryItemKey)) || {};

        /* Watchers */
        watch(() => state.selectedQueryId, (selectedQueryId) => {
            if (props.querySetId !== selectedQueryId) {
                const location: Location = {
                    params: { querySetId: selectedQueryId as string },
                    query: {},
                };

                SpaceRouter.router.replace(location);
            }
        });

        let unregisterStoreWatch;
        const registerStoreWatch = (currentQuery) => {
            unregisterStoreWatch = watch(() => costExplorerStore.getters['costAnalysis/currentQuerySetOptions'], (options: CostQuerySetOption) => {
                if (props.querySetId) return;

                const newQuery: CostAnalysisPageUrlQuery = {
                    granularity: primitiveToQueryString(options.granularity),
                    stack: primitiveToQueryString(options.stack),
                    group_by: arrayToQueryString(options.group_by),
                    period: objectToQueryString(options.period),
                    filters: objectToQueryString(options.filters),
                };


                if (!isEqual(newQuery, currentQuery)) {
                    SpaceRouter.router.replace({ query: newQuery }).catch((e) => {
                        if (e.name !== 'NavigationDuplicated') console.error(e);
                    });
                }
            }, { immediate: false });
        };

        onUnmounted(() => {
            if (unregisterStoreWatch) {
                unregisterStoreWatch();
            }
        });

        /* Page Init */
        (async () => {
            const currentQuery = SpaceRouter.router.currentRoute.query;
            // list cost query sets
            await costExplorerStore.dispatch('costAnalysis/listCostQueryList');

            // init states
            if (props.querySetId) {
                const { name, options } = getQueryWithKey(props.querySetId);
                if (name) {
                    setQueryOptions(options);
                    setSelectedQueryId(props.querySetId);
                } else {
                    setSelectedQueryId();
                }
            } else if (Object.keys(currentQuery).length) {
                const options = getQueryOptionsFromUrlQuery(currentQuery);
                setQueryOptions(options);
            } else {
                await costExplorerStore.dispatch('costAnalysis/initCostAnalysisStoreState');
            }

            // register store watch
            registerStoreWatch(currentQuery);
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .cost-analysis-chart {
        margin-bottom: 1rem;
    }
}
</style>
