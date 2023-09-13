<script setup lang="ts">

import {
    computed, defineEmits, defineProps, reactive,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { store } from '@/store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { BudgetUsageAnalyzeResult } from '@/services/cost-explorer/budget/budget-main/modules/budget-list/budget-main-page-api-helper';
import {
    getBudgetUsageAnalyzeRequestQuery,
} from '@/services/cost-explorer/budget/budget-main/modules/budget-list/budget-main-page-api-helper';
import BudgetListCard from '@/services/cost-explorer/budget/budget-main/modules/budget-list/BudgetListCard.vue';
import BudgetToolbox from '@/services/cost-explorer/budget/budget-main/modules/budget-toolbox/BudgetToolbox.vue';
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
    budgetUsages: [] as BudgetUsageAnalyzeResult[],
    loading: false,
    more: false,
    // query
    pageStart: 1,
    pageLimit: 24,
    queryStoreFilters: props.filters as ConsoleFilter[],
    period: {} as Period,
    // api request params
    sort: {
        key: 'budget_usage',
        desc: true,
    } as Query['sort'],
    budgetUsageParams: computed(() => {
        budgetUsageApiQueryHelper
            .setFilters(state.queryStoreFilters)
            .setPage(state.pageStart, state.pageLimit);
        const _query = getBudgetUsageAnalyzeRequestQuery(state.sort, state.period);
        return {
            query: { ..._query, ...budgetUsageApiQueryHelper.data },
        };
    }),
});

const fetchBudgetUsages = async (): Promise<{more: boolean; results: BudgetUsageAnalyzeResult[]}> => {
    try {
        state.loading = true;
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze(state.budgetUsageParams);
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
const handleUpdatePagination = (pageStart: number, pageLimit: number) => {
    state.pageStart = pageStart;
    state.pageLimit = pageLimit;
    listBudgets();
};

const handleUpdatePeriod = (period: Period) => {
    state.period = period;
    listBudgets();
};

const handleUpdateFilters = (filters: ConsoleFilter[]) => {
    state.queryStoreFilters = filters;
    emit('update:filters', filters);
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
    ];
    await store.dispatch('file/downloadExcel', {
        url: '/cost-analysis/budget-usage/analyze',
        param: {
            ...state.budgetUsageParams,
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
        <p-data-loader :data="state.budgetUsages"
                       :loading="state.loading"
        >
            <div class="budget-list-card-box">
                <budget-list-card v-for="(budgetUsage, i) in state.budgetUsages"
                                  :key="`${budgetUsage.budget_id}-${i}`"
                                  :budget-usage="budgetUsage"
                />
            </div>
            <template #no-data>
                <div class="no-budget-wrapper">
                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.NO_BUDGET') }}
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<style lang="postcss" scoped>
.budget-list {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        .no-data-wrapper {
            min-height: 20rem;
        }
    }
    .budget-list-card-box {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid-cols-1;
        }
    }
}
</style>
