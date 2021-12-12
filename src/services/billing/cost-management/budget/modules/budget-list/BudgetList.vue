<template>
    <div class="budget-list">
        <budget-toolbox :filters="_filters"
                        @update-range="handleUpdateRange"
                        @update-pagination="handleUpdatePagination"
                        @update-period="handleUpdatePeriod"
                        @update-filters="handleUpdateFilters"
                        @refresh="handleRefresh"
                        @export="handleExport"
                        @update-sort="handleUpdateSort"
        />
        <budget-stat :filters="_filters" :period="period" :usage-range="range" />
        <div class="budget-list-card-box">
            <budget-list-card v-for="budgetUsage in budgetUsages" :key="budgetUsage.budget_id"
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

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetListCard from '@/services/billing/cost-management/budget/modules/budget-list/BudgetListCard.vue';
import BudgetToolbox, { Pagination } from '@/services/billing/cost-management/budget/modules/budget-toolbox/BudgetToolbox.vue';
import BudgetStat from '@/services/billing/cost-management/budget/modules/budget-stat/BudgetStat.vue';
import {
    BudgetUsageAnalyzeRequestParam,
    BudgetUsageData,
    BudgetUsageRange,
} from '@/services/billing/cost-management/budget/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import { Period } from '@/services/billing/cost-management/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Query } from '@spaceone/console-core-lib/space-connector/type';
import { showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { i18n } from '@/translations';
import { store } from '@/store';

interface BudgetParam {
    query: Query;
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
    setup(props: Props, { emit, root }) {
        const budgetQueryHelper = new QueryHelper();
        const budgetUsageApiQueryHelper = new ApiQueryHelper();

        const state = reactive({
            budgetUsages: [] as BudgetUsageData[],
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
            sort: {
                key: 'usage',
                desc: true,
            },
            budgetUsageParam: computed<BudgetUsageAnalyzeRequestParam>(() => {
                const param = {
                    group_by: ['budget_id'],
                    include_budget_info: true,
                    ...budgetUsageApiQueryHelper.setFilters(state._filters)
                        .setPage(state.pageStart, state.pageLimit)
                        .setSort(state.sort.key, state.sort.desc)
                        .data,
                } as BudgetUsageAnalyzeRequestParam;

                if (state.period.start) param.start = state.period.start;

                if (state.range.min || state.range.max) param.usage_range = state.range;

                return param;
            }),
            excelFields: [
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
            ],
        });

        const setFilters = (filters: QueryStoreFilter[]) => {
            state._filters = filters;
            emit('update:filters', filters);
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

        const handleExport = async () => {
            try {
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);

                await store.dispatch('file/downloadExcel', {
                    url: '/cost-analysis/budget-usage/analyze',
                    param: {
                        ...state.budgetUsageParam,
                        query: budgetUsageApiQueryHelper.data,
                    },
                    fields: state.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.budget,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const handleUpdateSort = (sort) => {
            state.sort = sort;
            listBudgets();
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
            handleUpdateSort,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-list {
    .budget-list-card-box {
        @apply grid grid-cols-2 gap-4;

        @screen mobile {
            @apply grid-cols-1;
        }
    }
}
</style>
