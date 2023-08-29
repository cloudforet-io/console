<script setup lang="ts">

import {
    computed, defineEmits, defineProps, reactive,
} from 'vue';

import dayjs from 'dayjs';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetListCard from '@/services/cost-explorer/budget/modules/budget-list/BudgetListCard.vue';
import BudgetStat from '@/services/cost-explorer/budget/modules/budget-stat/BudgetStat.vue';
import type { Pagination } from '@/services/cost-explorer/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetToolbox from '@/services/cost-explorer/budget/modules/budget-toolbox/BudgetToolbox.vue';
import type {
    BudgetUsageAnalyzeRequestParam,
    BudgetUsageData,
    BudgetUsageRange,
} from '@/services/cost-explorer/budget/type';
import type { Period } from '@/services/cost-explorer/type';

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
    budgetUsages: [] as BudgetUsageData[],
    loading: false,
    // query
    range: {} as BudgetUsageRange,
    pageStart: 1,
    pageLimit: 24,
    totalCount: 0,
    queryStoreFilters: props.filters as ConsoleFilter[],
    period: {} as Period,
    // api request params
    sort: {
        key: 'usage',
        desc: true,
    },
    budgetUsageParam: computed<BudgetUsageAnalyzeRequestParam>(() => {
        const param = {
            group_by: ['budget_id'],
            include_budget_info: true,
            ...budgetUsageApiQueryHelper.setFilters(state.queryStoreFilters)
                .setPage(state.pageStart, state.pageLimit)
                .setSort(state.sort.key, state.sort.desc)
                .data,
        } as BudgetUsageAnalyzeRequestParam;

        if (state.period.start) param.start = dayjs.utc(state.period.start).format('YYYY-MM');
        if (state.period.end) param.end = dayjs.utc(state.period.end).format('YYYY-MM');

        if (state.range.min || state.range.max) param.usage_range = state.range;

        return param;
    }),
});

const setFilters = (filters: ConsoleFilter[]) => {
    state.queryStoreFilters = filters;
    emit('update:filters', filters);
};

const fetchBudgetUsages = async () => {
    try {
        const { results, total_count } = await SpaceConnector.client.costAnalysis.budgetUsage.analyze(state.budgetUsageParam);
        state.budgetUsages = results;
        state.totalCount = total_count;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.budgetUsages = [];
        state.totalCount = 0;
    }
};

const listBudgets = async () => {
    if (state.loading) return;

    state.loading = true;

    await fetchBudgetUsages();

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
        { key: 'usd_cost', name: 'USD Cost' },
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
                        :total-count="state.totalCount"
                        @update-range="handleUpdateRange"
                        @update-pagination="handleUpdatePagination"
                        @update-period="handleUpdatePeriod"
                        @update-filters="handleUpdateFilters"
                        @refresh="handleRefresh"
                        @export="handleExport"
                        @update-sort="handleUpdateSort"
        />
        <budget-stat :query-store-filters="state.queryStoreFilters"
                     :period="state.period"
                     :usage-range="state.range"
                     class="budget-stat"
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
