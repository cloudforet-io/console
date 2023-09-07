<script lang="ts" setup>
import {
    onUnmounted, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { isEqual } from 'lodash';

import { SpaceRouter } from '@/router';

import {
    arrayToQueryString,
    objectToQueryString,
    primitiveToQueryString,
    queryStringToArray,
    queryStringToObject,
    queryStringToString,
} from '@/lib/router-query-string';

import CostAnalysisChart from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisChart.vue';
import CostAnalysisDataTable from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisDataTable.vue';
import CostAnalysisGroupByFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisGroupByFilter.vue';
import CostAnalysisHeader from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisHeader.vue';
import CostAnalysisQueryFilter from '@/services/cost-explorer/cost-analysis/modules/CostAnalysisQueryFilter.vue';
import type { CostAnalysisPageUrlQuery } from '@/services/cost-explorer/cost-analysis/type';
import { useCostAnalysisPageStore } from '@/services/cost-explorer/store/cost-analysis-page-store';
import type {
    CostQuerySetModel, CostQuerySetOption, Granularity,
} from '@/services/cost-explorer/type';


interface Props {
    querySetId?: string;
}
const props = defineProps<Props>();
const route = useRoute();

const costAnalysisPageStore = useCostAnalysisPageStore();
const costAnalysisPageState = costAnalysisPageStore.$state;

/* util */
const setQueryOptions = (options?: CostQuerySetOption) => {
    if (options) costAnalysisPageStore.setQueryOptions(options);
    else costAnalysisPageStore.initState();
};

const getQueryOptionsFromUrlQuery = (urlQuery: CostAnalysisPageUrlQuery): CostQuerySetOption => ({
    granularity: queryStringToString(urlQuery.granularity) as Granularity,
    group_by: queryStringToArray(urlQuery.group_by),
    period: queryStringToObject(urlQuery.period) ?? {},
    filters: queryStringToObject(urlQuery.filters),
});

const getQueryWithKey = (queryItemKey: string): Partial<CostQuerySetModel> => (costAnalysisPageStore.costQueryList.find((item) => item.cost_query_set_id === queryItemKey)) || {};

let unregisterStoreWatch;
const registerStoreWatch = (currentQuery) => {
    unregisterStoreWatch = watch(() => costAnalysisPageState, (options: Partial<CostQuerySetOption>) => {
        if (props.querySetId) return;

        const newQuery: CostAnalysisPageUrlQuery = {
            granularity: primitiveToQueryString(options.granularity),
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
    costAnalysisPageStore.$dispose();
    costAnalysisPageStore.$reset();
});

watch(() => route.params, async (params) => {
    const costQuerySetId = params.costQuerySetId;

    if (costQuerySetId === costAnalysisPageStore.selectedQueryId) return;

    if (costQuerySetId) {
        const { options } = getQueryWithKey(costQuerySetId);
        await costAnalysisPageStore.setQueryOptions(options);
        costAnalysisPageStore.selectQueryId(costQuerySetId);
    } else {
        await costAnalysisPageStore.setQueryOptions();
        costAnalysisPageStore.selectQueryId(undefined);
    }
}, { immediate: true });

/* Page Init */
(async () => {
    const currentQuery = SpaceRouter.router.currentRoute.query;

    // init states
    if (props.querySetId) {
        const { name, options } = getQueryWithKey(props.querySetId);
        if (name) {
            setQueryOptions(options);
            costAnalysisPageStore.selectQueryId(props.querySetId);
        } else {
            costAnalysisPageStore.selectQueryId(undefined);
        }
    } else if (Object.keys(currentQuery).length) {
        const options = getQueryOptionsFromUrlQuery(currentQuery);
        setQueryOptions(options);
    } else {
        await costAnalysisPageStore.initState();
    }

    // register store watch
    registerStoreWatch(currentQuery);
})();

</script>

<template>
    <div class="cost-analysis-page">
        <cost-analysis-header />
        <cost-analysis-query-filter />
        <div class="content-wrapper">
            <div class="overflow-wrapper">
                <cost-analysis-group-by-filter />
                <cost-analysis-chart />
                <cost-analysis-data-table />
            </div>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-analysis-page {
    .content-wrapper {
        @apply bg-white rounded-md border border-gray-200;
        overflow-x: auto;
        padding: 0 1rem 2.5rem 1rem;
        .overflow-wrapper {
            min-width: 40rem;
        }
    }
}
</style>
