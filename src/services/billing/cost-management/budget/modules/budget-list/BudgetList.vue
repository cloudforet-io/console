<template>
    <div class="budget-list">
        <budget-toolbox @update-pagination="handleUpdatePagination"
                        @update-period="handleUpdatePeriod"
                        @update-filters="handleUpdateFilters"
                        @refresh="handleRefresh"
                        @export="handleExport"
        />
        <budget-stat :loading="loading" :budgets="budgets" />
        <div class="budget-list-card-box">
            <budget-list-card v-for="budget in budgets" :key="budget.budget_id"
                              :budget="budget"
                              :budget-usage="budgetUsageMap[budget.budget_id]"
                              :budget-loading="loading"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';

import { keyBy } from 'lodash';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetListCard from '@/services/billing/cost-management/budget/modules/budget-list/BudgetListCard.vue';
import BudgetToolbox, { Pagination } from '@/services/billing/cost-management/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';
import { BudgetData, BudgetUsageData } from '@/services/billing/cost-management/budget/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Period } from '@/services/billing/cost-management/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Filter, Query } from '@spaceone/console-core-lib/space-connector/type';

interface BudgetParam {
    query: Query;
}
interface BudgetUsageParam {
    group_by: string[];
    filter: Filter[];
    start?: string;
}

export default {
    name: 'BudgetList',
    components: { BudgetListCard, BudgetToolbox, BudgetStat },
    setup() {
        const budgetApiQueryHelper = new ApiQueryHelper();
        const budgetUsageQueryHelper = new QueryHelper();

        const state = reactive({
            budgets: [] as BudgetData[],
            budgetUsageMap: {} as Record<string, BudgetUsageData>,
            loading: false,
            // query
            pageStart: 1,
            pageLimit: 24,
            filters: [] as QueryStoreFilter[],
            period: {} as Period,
            // api request params
            budgetParam: computed(() => ({
                query: budgetApiQueryHelper
                    .setFilters(state.filters)
                    .setPage(state.pageStart, state.pageLimit)
                    .setSort('usage', true)
                    .data,
            })),
            budgetUsageParam: computed<BudgetUsageParam>(() => {
                const { filter } = budgetUsageQueryHelper.setFilters(state.filters)
                    .addFilter({ k: 'budget_id', v: state.budgets.map(d => d.budget_id), o: '=' })
                    .apiQuery;

                const param: BudgetUsageParam = {
                    group_by: ['budget_id'],
                    filter,
                };

                if (state.period.start) param.start = state.period.start;

                return param;
            }),
        });


        const fetchBudgets = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budget.list(state.budgetParam);

                state.budgets = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.budgets = [];
            }
        };

        const fetchBudgetUsages = async () => {
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze(state.budgetUsageParam);

                state.budgetUsageMap = keyBy(results, d => d.budget_id);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.budgetUsageMap = {};
            }
        };

        const listBudgets = async () => {
            if (state.loading) return;

            state.loading = true;

            await fetchBudgets();
            if (state.period.start) await fetchBudgetUsages();
            else state.budgetUsageMap = {};

            state.loading = false;
        };


        /* Handlers */
        const handleUpdatePagination = ({ pageStart, pageLimit }: Pagination) => {
            state.pageStart = pageStart;
            state.pageLimit = pageLimit;
            listBudgets();
        };

        const handleUpdatePeriod = (period: Period) => {
            state.period = period;
            listBudgets();
        };

        const handleUpdateFilters = (filters: QueryStoreFilter[]) => {
            state.filters = filters;
            listBudgets();
        };

        const handleRefresh = () => {
            listBudgets();
        };

        const handleExport = () => {

        };

        /* Init */
        (async () => {
            await listBudgets();
        })();

        return {
            ...toRefs(state),
            handleUpdatePagination,
            handleUpdatePeriod,
            handleUpdateFilters,
            handleRefresh,
            handleExport,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-list {
    @apply flex flex-col flex-wrap gap-4;
    .budget-list-card-box {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid-cols-1;
        }
    }
}
</style>
