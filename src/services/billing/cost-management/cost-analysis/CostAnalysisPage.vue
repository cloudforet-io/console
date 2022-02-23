<template>
    <div class="cost-analysis-page">
        <p-breadcrumbs :routes="routeState.route" />
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

import {
    PBreadcrumbs,
} from '@spaceone/design-system';

import CostAnalysisChart from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisQueryFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import CostAnalysisGroupByFilter from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisDataTable from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisDataTable.vue';

import { BILLING_ROUTE } from '@/services/billing/routes';
import {
    REQUEST_TYPE,
} from '@/services/billing/cost-management/cost-analysis/lib/config';
import { registerServiceStore } from '@/common/composables/register-service-store';
import {
    CostAnalysisStoreState,
} from '@/services/billing/cost-management/cost-analysis/store/type';
import costAnalysisStoreModule from '@/services/billing/cost-management/cost-analysis/store';
import { store } from '@/store';
import { i18n } from '@/translations';
import { SpaceRouter } from '@/router';
import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
    queryStringToArray, queryStringToBoolean,
    queryStringToObject,
    queryStringToString,
} from '@/lib/router-query-string';
import CostAnalysisHeader from '@/services/billing/cost-management/cost-analysis/modules/CostAnalysisHeader.vue';
import { CostAnalysisPageUrlQuery } from '@/services/billing/cost-management/cost-analysis/type';
import { CostQuerySetModel, CostQuerySetOption } from '@/services/billing/cost-management/type';
import { Location } from 'vue-router';
import { GROUP_BY } from '@/services/billing/cost-management/lib/config';

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
        PBreadcrumbs,
    },
    props: {
        querySetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        registerServiceStore<CostAnalysisStoreState>('costAnalysis', costAnalysisStoreModule);

        const state = reactive({
            costQueryList: computed<CostQuerySetModel[]>(() => store.state.service.costAnalysis.costQueryList),
            selectedQueryId: computed<string|undefined>(() => store.state.service.costAnalysis.selectedQueryId),
        });

        const routeState = reactive({
            route: computed(() => [
                { name: i18n.t('MENU.BILLING.BILLING'), to: { name: BILLING_ROUTE._NAME } },
                { name: i18n.t('MENU.BILLING.COST_MANAGEMENT'), to: { name: BILLING_ROUTE.COST_MANAGEMENT._NAME } },
                { name: i18n.t('MENU.BILLING.COST_ANALYSIS') },
            ]),
        });

        /* util */
        const setSelectedQueryId = (queryId?: string) => {
            store.commit('service/costAnalysis/setSelectedQueryId', queryId);
        };

        const setQueryOptions = (options?: Partial<CostQuerySetOption>) => {
            if (options) store.dispatch('service/costAnalysis/setQueryOptions', options);
            else store.dispatch('service/costAnalysis/initCostAnalysisStoreState');
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
            unregisterStoreWatch = store.watch((_, getters) => getters['service/costAnalysis/currentQuerySetOptions'], (options) => {
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
            await store.dispatch('service/costAnalysis/listCostQueryList');

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
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-analysis-page {
    .cost-analysis-chart {
        @apply relative z-10;
        margin-bottom: 1rem;
    }
}
</style>
