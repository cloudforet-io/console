<template>
    <div class="budget-list">
        <budget-toolbox :filters="_filters"
                        @update-range="handleUpdateRange"
                        @update-pagination="handleUpdatePagination"
                        @update-period="handleUpdatePeriod"
                        @update-filters="handleUpdateFilters"
                        @refresh="handleRefresh"
                        @export="handleExport"
        />
        <budget-stat :loading="loading" :budgets="budgets" />
        <div class="budget-list-card-box">
            <budget-list-card v-for="budgetUsage in budgetUsages" :key="budgetUsage.budget_id"
                              :budget="budgetMap[budgetUsage.budget_id]"
                              :budget-usage="budgetUsage"
                              :budget-loading="loading"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { keyBy } from 'lodash';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetListCard from '@/services/billing/cost-management/budget/modules/budget-list/BudgetListCard.vue';
import BudgetToolbox, { Pagination } from '@/services/billing/cost-management/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';
import { BudgetData, BudgetUsageData, BudgetUsageRange } from '@/services/billing/cost-management/budget/type';
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
    usage_range: BudgetUsageRange;
}

interface Props {
    filters: QueryStoreFilter[];
}

export default {
    name: 'BudgetList',
    components: { BudgetListCard, BudgetToolbox, BudgetStat },
    props: {
        filters: {
            type: Array,
            default: () => [],
        },
    },
    setup(props: Props, { emit }) {
        const budgetQueryHelper = new QueryHelper();
        const budgetUsageApiQueryHelper = new ApiQueryHelper();

        const state = reactive({
            budgetUsages: [] as BudgetUsageData[],
            budgets: [] as BudgetData[],
            budgetMap: computed<Record<string, BudgetData>>(() => keyBy(state.budgets, d => d.budget_id)),
            loading: false,
            // query
            range: {} as BudgetUsageRange,
            pageStart: 1,
            pageLimit: 24,
            _filters: props.filters as QueryStoreFilter[],
            period: {} as Period,
            // api request params
            budgetParam: computed<BudgetParam>(() => ({
                query: budgetQueryHelper
                    .setFilters([{ k: 'budget_id', v: state.budgetUsages.map(d => d.budget_id), o: '=' }])
                    .apiQuery,
            })),
            budgetUsageParam: computed<BudgetUsageParam>(() => {
                const param = {
                    group_by: ['budget_id'],
                    ...budgetUsageApiQueryHelper.setFilters(state._filters)
                        .setPage(state.pageStart, state.pageLimit)
                        .setSort('usage', true)
                        .data,
                } as BudgetUsageParam;

                if (state.period.start) param.start = state.period.start;

                if (state.range.min || state.range.max) param.usage_range = state.range;

                return param;
            }),
        });

        const setFilters = (filters: QueryStoreFilter[]) => {
            state._filters = filters;
            emit('update:filters', filters);
        };


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

                state.budgetUsages = results;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.budgetUsages = [];
            }
        };

        const listBudgets = async () => {
            if (state.loading) return;

            state.loading = true;

            await fetchBudgetUsages();
            await fetchBudgets();

            state.loading = false;
        };


        /* Handlers */
        const handleUpdateRange = (range: BudgetUsageRange) => {
            state.range = range;
            listBudgets();
        };

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
            setFilters(filters);
            listBudgets();
        };

        const handleRefresh = () => {
            listBudgets();
        };

        const handleExport = () => {

        };

        /* Watchers */
        watch(() => props.filters, (filters) => {
            if (filters !== state._filters) state._filters = filters;
        });

        /* Init */
        (async () => {
            await listBudgets();
        })();

        return {
            ...toRefs(state),
            handleUpdateRange,
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
