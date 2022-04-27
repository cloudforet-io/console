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
} from '@vue/composition-api';

import CostAnalysisChart from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisDataTable from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisDataTable.vue';

import {
    REQUEST_TYPE,
} from '@/services/cost-explorer/cost-analysis/lib/config';
import { SpaceRouter } from '@/router';
import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
    queryStringToArray, queryStringToBoolean,
    queryStringToObject,
    queryStringToString,
} from '@/lib/router-query-string';
import CostAnalysisHeader from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisHeader.vue';
import { CostAnalysisPageUrlQuery } from '@/services/cost-explorer/cost-analysis/type';
import { CostQuerySetModel, CostQuerySetOption } from '@/services/cost-explorer/type';
import { Location } from 'vue-router';
import { GROUP_BY } from '@/services/cost-explorer/lib/config';
import { costExplorerStore } from '@/services/cost-explorer/store';

export interface SaveQueryEmitParam {
    updatedQuery: CostQuerySetModel;
    requestType: REQUEST_TYPE;
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

        const setQueryOptions = (options?: Partial<CostQuerySetOption>) => {
            if (options) costExplorerStore.dispatch('costAnalysis/setQueryOptions', options);
            else costExplorerStore.dispatch('costAnalysis/initCostAnalysisStoreState');
        };

        const getQueryOptionsFromUrlQuery = (urlQuery: CostAnalysisPageUrlQuery): Partial<CostQuerySetOption> => ({
            granularity: queryStringToString(urlQuery.granularity),
            stack: queryStringToBoolean(urlQuery.stack),
            group_by: queryStringToArray(urlQuery.groupBy),
            primary_group_by: queryStringToString(urlQuery.primaryGroupBy) as GROUP_BY,
            period: queryStringToObject(urlQuery.period),
            filters: queryStringToObject(urlQuery.filters),
        });

        const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (state.costQueryList.find(item => item.cost_query_set_id === queryItemKey)) || {};


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
        const registerStoreWatch = () => {
            unregisterStoreWatch = watch(() => costExplorerStore.getters['costAnalysis/currentQuerySetOptions'], (options) => {
                if (props.querySetId) return;

                const newQuery: CostAnalysisPageUrlQuery = {
                    granularity: primitiveToQueryString(options.granularity),
                    stack: primitiveToQueryString(options.stack),
                    groupBy: arrayToQueryString(options.groupBy),
                    primaryGroupBy: primitiveToQueryString(options.primaryGroupBy),
                    period: objectToQueryString(options.period),
                    filters: objectToQueryString(options.filters),
                };

                const currentQuery = SpaceRouter.router.currentRoute.query;
                if (JSON.stringify(newQuery) !== JSON.stringify(currentQuery)) {
                    SpaceRouter.router.replace({ query: newQuery });
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
            } else {
                const options = getQueryOptionsFromUrlQuery(SpaceRouter.router.currentRoute.query);
                setQueryOptions(options);
            }

            // register store watch
            registerStoreWatch();
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
