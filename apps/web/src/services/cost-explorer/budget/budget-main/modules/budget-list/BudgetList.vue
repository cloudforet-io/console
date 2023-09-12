<script setup lang="ts">

import {
    computed, defineEmits, defineProps, reactive,
} from 'vue';

import { isEmpty } from 'lodash';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetListCard from '@/services/cost-explorer/budget/budget-main/modules/budget-list/BudgetListCard.vue';
import type {
    Pagination,
} from '@/services/cost-explorer/budget/budget-main/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetToolbox from '@/services/cost-explorer/budget/budget-main/modules/budget-toolbox/BudgetToolbox.vue';
import type { BudgetUsageAnalyzeModel } from '@/services/cost-explorer/budget/model';
import type { BudgetUsageAnalyzeRequestParam } from '@/services/cost-explorer/budget/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Period } from '@/services/cost-explorer/type';


const BUDGET_USAGE_ANALYZE_GROUP_BY_LIST = ['budget_id', 'name', 'project_id', 'project_group_id', 'data_source_id', 'provider_filter'];

interface Props {
    filters: ConsoleFilter[];
}

const props = withDefaults(defineProps<Props>(), {
    filters: () => [],
});
const emit = defineEmits<{(e: 'update:filters', filters:ConsoleFilter[]): void;
}>();

const budgetUsageApiQueryHelper = new ApiQueryHelper();
const state = reactive({
    budgetUsages: [] as BudgetUsageAnalyzeModel[],
    loading: false,
    // query
    pageStart: 1,
    pageLimit: 24,
    more: false,
    queryStoreFilters: props.filters as ConsoleFilter[],
    period: {} as Period,
    // api request params
    sort: {
        key: 'budget_usage',
        desc: true,
    } as Query['sort'],
    budgetUsageParam: computed<BudgetUsageAnalyzeRequestParam>(() => {
        budgetUsageApiQueryHelper
            .setFilters(state.queryStoreFilters)
            .setPage(state.pageStart, state.pageLimit);

        const _selectMap: Record<string, string> = {};
        BUDGET_USAGE_ANALYZE_GROUP_BY_LIST.forEach((groupBy) => {
            _selectMap[groupBy] = groupBy;
        });

        const query: BudgetUsageAnalyzeRequestParam['query'] = {
            group_by: BUDGET_USAGE_ANALYZE_GROUP_BY_LIST,
            fields: {
                total_spent: {
                    key: 'cost',
                    operator: 'sum',
                },
                total_budget: {
                    key: 'limit',
                    operator: 'sum',
                },
            },
            select: {
                ..._selectMap,
                total_spent: 'total_spent',
                total_budget: 'total_budget',
                budget_usage: {
                    operator: 'multiply',
                    fields: [
                        {
                            operator: 'divide',
                            fields: [
                                'total_spent',
                                'total_budget',
                            ],
                        },
                        100,
                    ],
                },
            },
            sort: [state.sort],
            ...budgetUsageApiQueryHelper.data,
        };

        if (!isEmpty(state.period)) {
            query.granularity = GRANULARITY.MONTHLY;
            query.start = state.period.start;
            query.end = state.period.end;
        }

        return { query };
    }),
});

const setFilters = (filters: ConsoleFilter[]) => {
    state.queryStoreFilters = filters;
    emit('update:filters', filters);
};

const fetchBudgetUsages = async (): Promise<{more: boolean; results: BudgetUsageAnalyzeModel[]}> => {
    try {
        state.loading = true;
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze(state.budgetUsageParam);
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    } finally {
        state.loading = false;
    }
};

const listBudgets = async () => {
    if (state.loading) return;
    const { more, results } = await fetchBudgetUsages();
    state.budgetUsages = results;
    state.more = more;
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

const handleUpdateFilters = (filters: ConsoleFilter[]) => {
    setFilters(filters);
    listBudgets();
};

const handleRefresh = () => {
    listBudgets();
};

const handleExport = async () => {
    const excelFields = [
        { key: 'budget_id', name: 'Budget ID' },
        { key: 'name', name: 'Budget Name' },
        { key: 'project_id', name: 'Project', reference: { reference_key: 'project_id', resource_type: 'identity.Project' } },
        { key: 'project_group_id', name: 'Project Group', reference: { reference_key: 'project_group_id', resource_type: 'identity.ProjectGroup' } },
        { key: 'cost', name: 'USD Cost' },
        { key: 'limit', name: 'Limit' },
        { key: 'usage', name: 'Usage (%)' },
        { key: 'cost_types.service_account_id', name: 'Cost Type (Service Account)', reference: { reference_key: 'service_account_id', resource_type: 'identity.ServiceAccount' } },
        { key: 'cost_types.region_code', name: 'Cost Type (Region)', reference: { reference_key: 'region_code', resource_type: 'inventory.Region' } },
        { key: 'cost_types.product', name: 'Cost Type (Product)' },
        { key: 'cost_types.provider', name: 'Cost Type (Provider)', reference: { reference_key: 'provider', resource_type: 'identity.Provider' } },
    ];
    await store.dispatch('file/downloadExcel', {
        url: '/cost-analysis/budget-usage/analyze',
        param: {
            ...state.budgetUsageParam,
            query: budgetUsageApiQueryHelper.data,
        },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.budget,
    });
};

const handleUpdateSort = (sort) => {
    state.sort = sort;
    listBudgets();
};

/* Init */
(async () => {
    await listBudgets();
})();


</script>

<template>
    <div class="budget-list">
        <budget-toolbox :filters="state.queryStoreFilters"
                        :more="state.more"
                        @update-pagination="handleUpdatePagination"
                        @update-period="handleUpdatePeriod"
                        @update-filters="handleUpdateFilters"
                        @refresh="handleRefresh"
                        @export="handleExport"
                        @update-sort="handleUpdateSort"
        />
        <div class="budget-list-card-box">
            <budget-list-card v-for="(budgetUsage, i) in state.budgetUsages"
                              :key="`${budgetUsage.budget_id}-${i}`"
                              :budget-usage="budgetUsage"
                              :budget-loading="state.loading"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.budget-list {
    .budget-stat {
        @apply border border-gray-200;
        padding: 1.125rem 0;
    }
    .budget-list-card-box {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid-cols-1;
        }
    }
}
</style>
