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
            <budget-list-card v-for="budget in budgets" :key="budget.budget_id" :budget="budget"
                              :budget-loading="loading"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import BudgetListCard from '@/services/billing/cost-management/budget/modules/budget-list/BudgetListCard.vue';
import BudgetToolbox, { Pagination } from '@/services/billing/cost-management/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';
import { BudgetData } from '@/services/billing/cost-management/budget/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Period } from '@/services/billing/cost-management/type';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

export default {
    name: 'BudgetList',
    components: { BudgetListCard, BudgetToolbox, BudgetStat },
    setup() {
        const state = reactive({
            budgets: [] as BudgetData[],
            loading: false,
            // query
            pageStart: 1,
            pageLimit: 24,
            filters: [] as QueryStoreFilter[],
            period: {} as Period,
        });

        const listBudget = async () => {
            if (state.loading) return;

            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.costAnalysis.budget.list();
                state.budgets = results;
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };


        /* Handlers */
        const handleUpdatePagination = ({ pageStart, pageLimit }: Pagination) => {
            state.pageStart = pageStart;
            state.pageLimit = pageLimit;
            listBudget();
        };

        const handleUpdatePeriod = (period: Period) => {
            state.period = period;
            listBudget();
        };

        const handleUpdateFilters = (filters: QueryStoreFilter[]) => {
            state.filters = filters;
            listBudget();
        };

        const handleRefresh = () => {
            listBudget();
        };

        const handleExport = () => {

        };

        /* Init */
        (async () => {
            await listBudget();
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
