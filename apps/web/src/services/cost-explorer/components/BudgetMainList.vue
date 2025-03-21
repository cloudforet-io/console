<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Sort, Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PDataLoader,
} from '@cloudforet/mirinae';

import type { AnalyzeResponse } from '@/api-clients/_common/schema/api-verbs/analyze';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type {
    BudgetUsageAnalyzeParameters,
    BudgetUsageAnalyzeResult,
} from '@/api-clients/cost-analysis/budget-usage/schema/api-verbs/analyze';
import { SpaceRouter } from '@/router';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetMainListCard from '@/services/cost-explorer/components/BudgetMainListCard.vue';
import BudgetMainToolbox from '@/services/cost-explorer/components/BudgetMainToolbox.vue';
import {
    getBudgetUsageAnalyzeRequestQuery,
} from '@/services/cost-explorer/helpers/budget-usage-analyze-api-query-helper';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';


const currentRoute = SpaceRouter.router.currentRoute;
const queryHelper = new QueryHelper();
const budgetUsageApiQueryHelper = new ApiQueryHelper();
const appContextStore = useAppContextStore();
const userStore = useUserStore();
const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    budgetUsages: [] as BudgetUsageAnalyzeResult[],
    loading: false,
    more: false,
    // query
    queryFilters: queryHelper.setFiltersAsRawQueryString(currentRoute.query.filters).filters as ConsoleFilter[],
    pageStart: 1,
    pageLimit: 24,
    period: {} as Period,
    // api request params
    sort: [{
        key: 'budget_usage',
        desc: true,
    }] as Query['sort'],
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});

const fetchBudgetUsages = async (): Promise<AnalyzeResponse<BudgetUsageAnalyzeResult>> => {
    try {
        state.loading = true;
        budgetUsageApiQueryHelper
            .setFilters(state.queryFilters)
            .setPage(state.pageStart, state.pageLimit);
        if (storeState.isAdminMode) {
            budgetUsageApiQueryHelper.addFilter({
                k: 'resource_group',
                v: RESOURCE_GROUP.WORKSPACE,
            });
        }
        const _query = getBudgetUsageAnalyzeRequestQuery(state.sort, state.period);
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze<BudgetUsageAnalyzeParameters, AnalyzeResponse<BudgetUsageAnalyzeResult>>({
            query: {
                ...budgetUsageApiQueryHelper.data,
                ..._query,
            },
        });
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
    state.budgetUsages = results ?? [];
    state.more = !!more;
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
    state.queryFilters = filters;
    SpaceRouter.router.replace({
        query: {
            filters: queryHelper.setFilters(filters).rawQueryStrings,
        },
    });
    listBudgets();
};

const handleRefresh = () => {
    listBudgets();
};

const handleExport = async () => {
    const targetFields: ExcelDataField[] = [];
    if (storeState.isAdminMode) {
        targetFields.push({ key: 'workspace_id', name: 'Workspace ID' });
    } else {
        targetFields.push({ key: 'project_id', name: 'Project', reference: { reference_key: 'project_id', resource_type: 'identity.Project' } });
    }
    const excelFields: ExcelDataField[] = [
        ...targetFields,
        { key: 'budget_id', name: 'Budget ID' },
        { key: 'name', name: 'Budget Name' },
        { key: 'data_source_id', name: 'Data Source ID' },
        { key: 'provider_filter.providers', name: 'Providers' },
        { key: 'total_spent', name: 'Total Spent' },
        { key: 'total_budget', name: 'Total Budget' },
        { key: 'budget_usage', name: 'Usage (%)' },
    ];
    await downloadExcel({
        data: state.budgetUsages,
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.budget,
    });
};

const handleUpdateSort = (sort: Sort) => {
    state.sort = [sort];
    listBudgets();
};

/* Init */
(async () => {
    await listBudgets();
})();


</script>

<template>
    <div class="budget-main-list">
        <budget-main-toolbox
            :filters="state.queryFilters"
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
                <budget-main-list-card
                    v-for="(budgetUsage, i) in state.budgetUsages"
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
.budget-main-list {
    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        .no-data-wrapper {
            min-height: 20rem;
        }
    }
    .budget-list-card-box {
        @apply grid grid-cols-2 gap-4;
        @apply mobile:grid-cols-1;
    }
}
</style>
