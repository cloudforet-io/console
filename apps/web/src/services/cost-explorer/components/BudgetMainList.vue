<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';

import { SpaceRouter } from '@/router';
import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type {
    BudgetUsageAnalyzeResult,
} from '@/schema/cost-analysis/budget-usage/api-verbs/analyze';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

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
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
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
                v: 'WORKSPACE',
            });
        }
        const _query = getBudgetUsageAnalyzeRequestQuery(state.sort, state.period);
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
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

const budgetUsageExportQueryHelper = new QueryHelper();
const handleExport = async () => {
    const targetFields: ExcelDataField[] = [];
    if (storeState.isAdminMode) {
        targetFields.push({ key: 'workspace_id', name: 'Workspace ID' });
    } else {
        targetFields.push({ key: 'project_id', name: 'Project', reference: { reference_key: 'project_id', resource_type: 'identity.Project' } });
        targetFields.push({ key: 'project_group_id', name: 'Project Group', reference: { reference_key: 'project_group_id', resource_type: 'identity.ProjectGroup' } });
    }
    const excelFields: ExcelDataField[] = [
        { key: 'budget_id', name: 'Budget ID' },
        { key: 'name', name: 'Budget Name' },
        ...targetFields,
        { key: 'data_source_id', name: 'Data Source ID' },
        { key: 'provider_filter.providers', name: 'Providers' },
        { key: 'total_spent', name: 'Total Spent' },
        { key: 'total_budget', name: 'Total Budget' },
        { key: 'budget_usage', name: 'Usage (%)' },
    ];
    budgetUsageExportQueryHelper.setFilters(state.queryFilters);
    const _query = getBudgetUsageAnalyzeRequestQuery(state.sort, state.period);
    await downloadExcel({
        url: '/cost-analysis/budget-usage/analyze',
        param: {
            query: {
                ..._query,
                filter: budgetUsageExportQueryHelper.apiQuery.filter,
            },
        },
        fields: excelFields,
        file_name_prefix: FILE_NAME_PREFIX.budget,
        version: 'v2',
        timezone: state.timezone,
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

        @screen mobile {
            @apply grid-cols-1;
        }
    }
}
</style>
