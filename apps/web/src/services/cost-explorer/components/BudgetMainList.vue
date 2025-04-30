<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, onMounted, reactive, watch,
} from 'vue';


import dayjs from 'dayjs';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import {
    PToolboxTable, PSelectDropdown, PI, PProgressBar, PStatus, PLink,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useProjectReferenceStore } from '@/store/reference/project-reference-store';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import type { ListResponse } from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useQueryTags } from '@/common/composables/query-tags';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import BudgetDeleteCheckModal from '@/services/cost-explorer/components/BudgetDeleteCheckModal.vue';
import BudgetMainToolset from '@/services/cost-explorer/components/BudgetMainToolset.vue';
import { BUDGET_SEARCH_HANDLERS } from '@/services/cost-explorer/constants/budget-constant';
import { BUDGET_EXCEL_FIELDS } from '@/services/cost-explorer/constants/budget-table-constant';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useBudgetCreatePageStore } from '@/services/cost-explorer/stores/budget-create-page-store';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';



interface Props {
  modalVisible: boolean;
}

interface BudgetMainListState {
    budgets: BudgetModel[];
    budgetUsages: {budget_id: string; name: string; budget: number; actual_spend: number; utilization: number; date: string; currency: Currency}[];
    more: boolean;
    loading: boolean;
    modalVisible: boolean;
    queryFilters: ConsoleFilter[];
    pageStart: number;
    pageLimit: number;
    period: Period;
    query: any;
    isExpiredBudgetsHidden: boolean;
    selectedIndex: number[];
    isEditable: ComputedRef<boolean>;
    isDeleteable: ComputedRef<boolean>;
    selectedBudgetIds: string[];
    addRequests: any;
}

interface BudgetQuery {
    budgetUsed: string|undefined;
    cycle: string|undefined;
    period: string|undefined;
    projectList: string[];
    serviceAccountList: any[];
    utilization?: string;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
});

const emit = defineEmits<{(e: 'update:select-month-modal-visible', value: boolean): void;}>();

const currentRoute = SpaceRouter.router.currentRoute;
const queryHelper = new QueryHelper();
const budgetUsageApiQueryHelper = new ApiQueryHelper();

const appContextStore = useAppContextStore();
const serviceAccountReferenceStore = useServiceAccountReferenceStore();
const budgetCreatePageStore = useBudgetCreatePageStore();
const budgetCreatePageState = budgetCreatePageStore.state;
const userStore = useUserStore();
const userState = userStore.state;
const projectReferenceStore = useProjectReferenceStore();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);
const timeZone = computed<string>(() => userState.timezone || '');

const state = reactive<BudgetMainListState>({
    budgets: [],
    budgetUsages: [],
    more: false,
    loading: false,
    modalVisible: false,
    queryFilters: queryHelper.setFiltersAsRawQueryString(currentRoute.query.filters).filters,
    pageStart: 1,
    pageLimit: 24,
    period: {},
    query: undefined,
    isExpiredBudgetsHidden: false,
    selectedIndex: [],
    isEditable: computed<boolean>(() => state.selectedIndex.length === 1),
    isDeleteable: computed<boolean>(() => state.selectedIndex.length > 0),
    selectedBudgetIds: [],
    addRequests: undefined,
});

const tableState = reactive({
    fields: [
        {
            name: 'name',
            label: 'Name',
            width: '13%',
        },
        {
            name: 'target',
            label: 'Target',
            width: '20%',
            sortable: false,
        },
        {
            name: 'cycle',
            label: 'Cycle',
            width: '7%',
        },
        {
            name: 'period',
            label: 'Period',
            width: '10%',
            sortable: false,
        },
        {
            name: 'limit',
            label: 'Budget',
            width: '10%',
        },
        {
            name: 'actualSpend',
            label: 'Actual Spend',
            width: '10%',
            sortable: false,
        },
        {
            name: 'utilization_rate',
            label: 'Utilization',
            width: '10%',
        },
        {
            name: 'remaining',
            label: 'Remaining',
            width: '10%',
            sortable: false,
        },
        {
            name: 'state',
            label: 'State',
            width: '7%',
        },
    ],
    items: computed(() => (state.budgets || []).map((budget: BudgetModel) => {
        const startDate = dayjs.utc(budget.start, 'YYYY-MM');
        const endDate = dayjs.utc(budget.end, 'YYYY-MM');
        return {
            name: budget.name,
            target: budget.service_account_id ? budget.service_account_id : budget.project_id,
            cycle: budget.time_unit,
            // eslint-disable-next-line no-nested-ternary
            period: (budget.time_unit === 'TOTAL') || (budget.time_unit === 'MONTHLY' && endDate.isBefore(dayjs.utc(), 'month'))
                ? `${startDate.format('YYYY-MM')} ~ ${endDate.format('YYYY-MM')}`
                : (budget.time_unit === 'MONTHLY' && startDate.isAfter(dayjs.utc(), 'month'))
                    ? startDate.format('YYYY-MM')
                    : dayjs.utc().format('YYYY-MM'),
            limit: budget.limit ?? 0,
            actualSpend: budget.time_unit === 'MONTHLY' ? state.budgetUsages
                .filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id && dayjs.utc().format('YYYY-MM') === dayjs.utc(budgetUsage.date).format('YYYY-MM'))
                .map((budgetUsage) => budgetUsage.actual_spend)[0] ?? 0
                : (state.budgetUsages || []).filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id).map((budgetUsage) => budgetUsage.actual_spend).reduce((acc, cur) => acc + cur, 0),
            utilization_rate: budget.utilization_rate ? budget.utilization_rate : 0,
            remaining: (budget.limit ?? 0) - (
                budget.time_unit === 'MONTHLY'
                    ? state.budgetUsages
                        .filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id && dayjs.utc().format('YYYY-MM') === dayjs.utc(budgetUsage.date).format('YYYY-MM'))
                        .map((budgetUsage) => budgetUsage.actual_spend)[0] ?? 0
                    : (state.budgetUsages || []).filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id).map((budgetUsage) => budgetUsage.actual_spend).reduce((acc, cur) => acc + cur, 0)
            ),
            state: budget.state,
        };
    })),
    actionMenus: computed<MenuItem[]>(() => [
        { name: 'delete', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE'), disabled: !state.isDeleteable },
    ]),
    selectedActionItem: '',
    valueHandlerMap: computed(() => ({
        name: makeDistinctValueHandler('cost_analysis.Budget', 'name', 'string'),
        time_unit: makeDistinctValueHandler('cost_analysis.Budget', 'time_unit', 'string'),
        budget_manager_id: makeDistinctValueHandler('cost_analysis.Budget', 'budget_manager_id', 'string'),
        'notification.recipients.users': makeDistinctValueHandler('cost_analysis.Budget', 'notification.recipients.users'),
    })),
});

const budgetApiQueryHelper = new ApiQueryHelper()
    .setPage(state.pageStart, state.pageLimit)
    .setSort('utilization_rate', true);

const queryTagHelper = useQueryTags({ keyItemSets: BUDGET_SEARCH_HANDLERS });
const { queryTags } = queryTagHelper;

const handleModalVisible = (visible: boolean) => {
    emit('update:select-month-modal-visible', visible);
};

const handleQuery = (query: BudgetQuery) => {
    state.query = query;
};

const handleDeleteConfirm = async () => {
    budgetCreatePageState.loading = true;
    try {
        await fetchBudgets();
        await listBudgetUsages();
    } finally {
        state.selectedIndex = [];
        budgetCreatePageState.loading = false;
    }
};

const getBudgetFilters = (): ApiFilter[] => {
    const filters: ApiFilter[] = [];

    if (state.query?.target) {
        if (state.query.target === 'project') {
            filters.push({
                k: 'service_account_id',
                v: [null, ''],
                o: 'in',
            });
        } else if (state.query.target === 'serviceAccount') {
            filters.push({
                k: 'service_account_id',
                v: [null, ''],
                o: 'not_in',
            });
        }
    }

    if (state.query?.year && state.query?.year !== 'all') {
        filters.push({
            k: 'start',
            v: `${state.query.year}-12`,
            o: 'lte',
        });
        filters.push({
            k: 'end',
            v: `${state.query.year}-01`,
            o: 'gte',
        });
    }

    if (state.query?.cycle && state.query.cycle !== 'all') {
        filters.push({
            k: 'time_unit',
            v: state.query.cycle === 'fixedTerm' ? 'TOTAL' : 'MONTHLY',
            o: 'eq',
        });
    }

    if (state.query?.workspaceList && state.query.workspaceList.length > 0) {
        filters.push({
            k: 'workspace_id',
            v: state.query.workspaceList,
            o: 'contain_in',
        });
    }

    if (state.query?.projectList && state.query?.projectList?.length) {
        filters.push({
            k: 'project_id',
            v: state.query.projectList,
            o: 'contain_in',
        });
    }

    if (state.query?.serviceAccountList?.length) {
        filters.push({
            k: 'service_account_id',
            v: state.query.serviceAccountList,
            o: 'contain_in',
        });
    }

    if (state.query?.utilization && state.query.utilization !== 'all') {
        const utilizationMap: Record<string, number> = {
            budgetExceeded: 100,
            overNintyPercentSpent: 90,
            overEightyPercentSpent: 80,
            overSeventyPercentSpent: 70,
            overSixtyPercentSpent: 60,
            overFiftyPercentSpent: 50,
            overFortyPercentSpent: 40,
            overThirtyPercentSpent: 30,
            overTwentyPercentSpent: 20,
            overTenPercentSpent: 10,
        };

        const value = utilizationMap[state.query.utilization];
        if (value !== undefined) {
            filters.push({
                k: 'utilization_rate',
                v: value,
                o: state.query.utilization === 'budgetExceeded' ? 'gt' : 'gte',
            });
        }
    }

    return filters;
};

/* API */
const fetchBudgetUsages = async () => {
    try {
        state.loading = true;
        if (isAdminMode.value) {
            budgetUsageApiQueryHelper.addFilter({
                k: 'resource_group',
                v: RESOURCE_GROUP.WORKSPACE,
            });
        }
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            query: {
                group_by: ['budget_id', 'name', 'date', 'currency', 'limit'],
                fields: {
                    actual_spend: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                page: { limit: 200 },
                ...budgetUsageApiQueryHelper.data,
            },
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    } finally {
        state.loading = false;
    }
};


const fetchBudgets = async () => {
    if (state.loading) return;

    const filters = getBudgetFilters();

    const { results } = await SpaceConnector.clientV2.costAnalysis.budget.list<BudgetListParameters, ListResponse<BudgetModel>>({
        query: {
            filter: filters,
            ...budgetApiQueryHelper.data,
        },
    });

    state.budgets = results;
};

const listBudgetUsages = async () => {
    const { more, results } = await fetchBudgetUsages();
    state.budgetUsages = results ?? [];
    state.more = !!more;
};

const getProjectName = (projectId: string): string|undefined => projectReferenceStore.getters.projectItems[projectId]?.label;
const getServiceAccountName = (serviceAccountId: string): string|undefined => serviceAccountReferenceStore.getters.serviceAccountItems[serviceAccountId]?.label;

const handleUpdateSelectIndex = async (indicies: number[]) => {
    state.selectedIndex = indicies;
};

const handleDelete = () => {
    state.modalVisible = true;
};

const handleChange = async (options: any = {}) => {
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.queryTags !== undefined) {
        state.queryFilters = queryHelper.setFiltersAsQueryTag(options.queryTags).filters;
    }

    if (options.sortBy || options.sortDesc !== undefined) {
        const key = options.sortBy ?? 'name';
        const desc = options.sortDesc ?? true;
        let budgetSortKey = key;
        let usageSortKey = key;

        if (key === 'actualSpend') {
            budgetSortKey = 'name';
            usageSortKey = 'utilization_rate';
        } else if (key === 'cycle') {
            budgetSortKey = 'time_unit';
        }

        budgetApiQueryHelper.setSort(budgetSortKey, desc);
        budgetUsageApiQueryHelper.setSort(usageSortKey, desc);
    }

    budgetApiQueryHelper.setFilters(state.queryFilters);
    await fetchBudgets();
    await listBudgetUsages();
};

const handleExportToExcel = async () => {
    await downloadExcel({
        fields: BUDGET_EXCEL_FIELDS,
        data: tableState.items.map((item, idx) => ({
            ...item,
            target: item.target.startsWith('project-') ? `Project: ${getProjectName(item.target)}` : `Service: ${getServiceAccountName(item.target)}`,
            cycle: item.cycle === 'TOTAL' ? i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FIXED_TERM') : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTHLY'),
            limit: `${CURRENCY_SYMBOL[state.budgets[idx].currency]} ${item.limit}`,
            actualSpend: `${CURRENCY_SYMBOL[state.budgets[idx].currency]} ${Number(item.actualSpend).toFixed(3)}`,
            utilization_rate: `${item.utilization_rate}%`,
            remaining: item.remaining < 0 ? `-${CURRENCY_SYMBOL[state.budgets[idx].currency]} ${Math.abs(item.remaining.toFixed(2)).toLocaleString()}`
                : `${CURRENCY_SYMBOL[state.budgets[idx].currency]} ${item.remaining.toFixed(2).toLocaleString()}`,
        })),
        file_name_prefix: FILE_NAME_PREFIX.budget,
        timezone: timeZone.value,
    });
};

/* Watcher */
watch(() => state.query, async () => {
    state.addRequests = {
        project_id: state.query?.projectList ?? [],
    };
    await fetchBudgets();
}, { deep: true, immediate: true });

watch(() => state.selectedIndex, () => {
    state.selectedBudgetIds = [];
    if (state.selectedIndex.length > 0) {
        state.selectedIndex.forEach((i) => {
            state.selectedBudgetIds.push(state.budgets[i].budget_id);
        });
    }
}, { immediate: true });

/* Mounted */
onMounted(async () => {
    await fetchBudgets();
    await listBudgetUsages();
});
</script>

<template>
    <div>
        <div class="flex flex-col gap-4">
            <budget-main-toolset :modal-visible="props.modalVisible"
                                 @update:select-month-modal-visible="handleModalVisible"
                                 @update:query="handleQuery"
            />
            <p-toolbox-table :fields="tableState.fields"
                             :items="tableState.items"
                             multi-select
                             selectable
                             sortable
                             sort-desc
                             sort-by="utilization_rate"
                             pagination-visible
                             exportable
                             search-type="query"
                             searchable
                             :select-index="state.selectedIndex"
                             :key-item-sets="BUDGET_SEARCH_HANDLERS"
                             :value-handler-map="tableState.valueHandlerMap"
                             :query-tags="queryTags"
                             @update:select-index="handleUpdateSelectIndex"
                             @change="handleChange"
                             @refresh="handleChange()"
                             @export="handleExportToExcel"
            >
                <template #toolbox-left>
                    <p-select-dropdown placeholder="Action"
                                       :menu="tableState.actionMenus"
                                       :selected.sync="tableState.selectedActionItem"
                                       reset-selected-on-unmounted
                                       @select="handleDelete"
                    />
                </template>
                <template #col-name-format="{value, rowIndex}">
                    <div class="flex flex-col gap-5">
                        <p-link highlight
                                :to="{
                                    name: isAdminMode ? ADMIN_COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME : COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
                                    params: {
                                        budgetId: state.budgets[rowIndex].budget_id
                                    }
                                }"
                        >
                            {{ value }}
                        </p-link>
                    </div>
                </template>
                <template #col-limit-format="{item, value, rowIndex}">
                    <p class="flex gap-0.5"
                       :class="{ expired: item.state === 'EXPIRED' }"
                    >
                        <span>{{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}</span>
                        <span>{{ Number(value).toLocaleString() }}</span>
                    </p>
                </template>
                <template #col-cycle-format="{value, item}">
                    <p class="flex gap-2 items-center"
                       :class="{ expired: item.state === 'EXPIRED' }"
                    >
                        <span v-if="value === 'MONTHLY'">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTHLY') }}</span>
                        <span v-else>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FIXED_TERM') }}</span>
                    </p>
                </template>
                <template #col-period-format="{value, item}">
                    <span :class="{ expired: item.state === 'EXPIRED' }">{{ value }}</span>
                </template>
                <template #col-target-format="{value}">
                    <div v-if="value.startsWith('project-')"
                         class="flex items-center gap-0.5"
                    >
                        <p-i name="ic_project"
                             width="1rem"
                             height="1rem"
                        />
                        <project-link-button :project-id="value" />
                    </div>
                    <p-link v-else
                            :text="value"
                            action-icon="internal-link"
                            new-tab
                            :to="{
                                name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
                                params: {
                                    serviceAccountId: value
                                }
                            }"
                            icon-left="ic_service_security"
                            class="flex gap-0.5 items-center"
                    >
                        <span>{{ getServiceAccountName(value) }}</span>
                    </p-link>
                </template>
                <template #col-actualSpend-format="{item, value, rowIndex}">
                    <p :class="{ expired: item.state === 'EXPIRED' }">
                        {{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}
                        {{ Number(value).toLocaleString() }}
                    </p>
                </template>
                <template #col-utilization_rate-format="{item, value}">
                    <div :class="{ expired: item.state === 'EXPIRED' }">
                        <div v-if="value > -1">
                            <p-progress-bar :percentage="value"
                                            :color="Number(value) < 100
                                                && Number(value) > 0
                                                ? '#7F9CF5' : '#FF6A6A'"
                            />
                            <span>{{ Number(value).toFixed(2) }} %</span>
                        </div>
                    </div>
                </template>
                <template #col-remaining-format="{item, value, rowIndex}">
                    <p :class="{exceeded: Number(value) < 0, expired: item.state === 'EXPIRED' }">
                        {{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}
                        {{ Math.abs(value.toFixed(2)).toLocaleString() }}
                    </p>
                </template>

                <template #col-state-format="{value}">
                    <div v-if="value === 'SCHEDULED'">
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.SCHEDULED') }}
                    </div>
                    <div v-else-if="value === 'EXPIRED'">
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.EXPIRED') }}
                    </div>
                    <p-status v-else
                              theme="green"
                              :text="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ACTIVE_TIL_DATE')"
                    />
                </template>
            </p-toolbox-table>
        </div>
        <budget-delete-check-modal
            :visible="state.modalVisible"
            :selected-indices="state.selectedBudgetIds"
            @update:visible="state.modalVisible = $event"
            @confirm="handleDeleteConfirm"
        />
    </div>
</template>

<style scoped lang="postcss">
.expired {
    opacity: 0.5;
}

.exceeded {
    @apply text-red-500;
    &::before {
        content: '-';
    }
}
</style>
