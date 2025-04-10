<script lang="ts" setup>
import type { ComputedRef } from 'vue';
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import {
    PToolboxTable, PSelectDropdown, PButtonModal, PI, PProgressBar, PStatus, PLink,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';

import type { ListResponse } from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import BudgetMainToolset from '@/services/cost-explorer/components/BudgetMainToolset.vue';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';

import type { Period } from '../types/cost-explorer-query-type';
import BudgetDeleteCheckModal from './BudgetDeleteCheckModal.vue';


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
    sort: Query['sort'];
    query: any;
    isExpiredBudgetsHidden: boolean;
    selectedIndex: number[];
    isEditable: ComputedRef<boolean>;
    isDeleteable: ComputedRef<boolean>;
    selectedBudgetIds: string[];
}

interface BudgetQuery {
    budgetUsed: string|undefined;
    cycle: string|undefined;
    period: string|undefined;
    projectList: string[];
    serviceAccountList: any[];
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
const userWorkspaceStore = useUserWorkspaceStore();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

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
    sort: [{
        key: 'budget_usage',
        desc: true,
    }],
    query: undefined,
    isExpiredBudgetsHidden: false,
    selectedIndex: [],
    isEditable: computed<boolean>(() => state.selectedIndex.length === 1),
    isDeleteable: computed<boolean>(() => state.selectedIndex.length > 0),
    selectedBudgetIds: [],
});

const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Name',
            width: '13%',
        },
        {
            name: 'target',
            label: 'Target',
            width: '20%',
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
        },
        {
            name: 'budget',
            label: 'Budget',
            width: '10%',
        },
        {
            name: 'actualSpend',
            label: 'Actual Spend',
            width: '10%',
        },
        {
            name: 'utilization',
            label: 'Utilization',
            width: '10%',
        },
        {
            name: 'remaining',
            label: 'Remaining',
            width: '10%',
        },
        {
            name: 'state',
            label: 'State',
            width: '7%',
        },
    ]),
    items: computed(() => state.budgets.map((budget) => {
        const startDate = dayjs.utc(budget.start, 'YYYY-MM');
        const endDate = dayjs.utc(budget.end, 'YYYY-MM');
        return {
            name: budget.name,
            target: budget.service_account_id ? budget.service_account_id : budget.project_id,
            cycle: budget.time_unit,
            period: budget.time_unit === 'MONTHLY' ? dayjs.utc().format('YYYY-MM')
                : `${startDate.format('YYYY-MM')} ~ ${endDate.format('YYYY-MM')}`,
            budget: budget.time_unit === 'MONTHLY' ? state.budgetUsages.filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id
            && dayjs.utc(budgetUsage.date).format('YYYY-MM') === dayjs.utc().format('YYYY-MM'))
                .map((budgetUsage) => budgetUsage.budget)[0] ?? 0 : budget.limit,
            actualSpend: budget.time_unit === 'MONTHLY' ? state.budgetUsages
                .filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id && dayjs.utc().format('YYYY-MM') === dayjs.utc(budgetUsage.date).format('YYYY-MM'))
                .map((budgetUsage) => budgetUsage.actual_spend)[0] ?? 0
                : state.budgetUsages.filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id).map((budgetUsage) => budgetUsage.actual_spend).reduce((acc, cur) => acc + cur, 0),
            utilization: budget.time_unit === 'MONTHLY' ? state.budgetUsages.filter((budgetUsage) => budgetUsage.budget_id === budget.budget_id
            && dayjs.utc().format('YYYY-MM') === dayjs.utc(budgetUsage.date).format('YYYY-MM')).map((budgetUsage) => budgetUsage.utilization)[0] ?? 0
                : 0,
            remaining: 0,
            state: dayjs.utc().isSameOrAfter(startDate, 'month') && dayjs.utc().isSameOrBefore(endDate, 'month')
                ? i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ACTIVE_TIL_DATE') : 'EXPIRED',
        };
    })),
    actionMenus: computed<MenuItem[]>(() => [
        { name: 'delete', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE'), disabled: !state.isDeleteable },
    ]),
    selectedActionItem: '',
});

const budgetApiQueryHelper = new ApiQueryHelper()
    .setPage(state.pageStart, state.pageLimit);

const handleModalVisible = (visible: boolean) => {
    emit('update:select-month-modal-visible', visible);
};

const handleQuery = (query: BudgetQuery) => {
    state.query = query;
};

/* API */
const fetchBudgetUsages = async () => {
    try {
        state.loading = true;
        budgetUsageApiQueryHelper
            .setFilters(state.queryFilters)
            .setPage(state.pageStart, state.pageLimit);
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
                select: {
                    budget_id: 'budget_id',
                    name: 'name',
                    actual_spend: 'actual_spend',
                    budget: 'budget',
                    utilization: {
                        operator: 'multiply',
                        fields: [
                            {
                                operator: 'divide',
                                fields: ['actual_spend', 'budget'],
                            },
                            100,
                        ],
                    },
                    date: 'date',
                    currency: 'currency',
                },
                sort: [{ key: 'utilization', desc: true }],
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
    const { results } = await SpaceConnector.clientV2.costAnalysis.budget.list<BudgetListParameters, ListResponse<BudgetModel>>({
        query: {
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

const getServiceAccountName = (serviceAccountId: string): string|undefined => serviceAccountReferenceStore.getters.serviceAccountItems[serviceAccountId]?.label;

const handleUpdateSelectIndex = async (indicies: number[]) => {
    state.selectedIndex = indicies;
};

const handleDelete = () => {
    state.modalVisible = true;
};

/* Watcher */
watch(() => state.query, () => {
    budgetApiQueryHelper.setFilters([
        {
            k: 'project_id',
            v: state.query.projectList ?? '',
            o: '',
        },
        {
            k: 'service_account_id',
            v: state.query.serviceAccountList,
            o: '',
        },
    ]);
}, { deep: true, immediate: true });

watch(() => state.query, async () => {
    if (state.query.projectList && state.query.projectList.length > 0 || state.query.serviceAccountList) {
        await fetchBudgets();
    }
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
                             sort-by="name"
                             pagination-visible
                             exportable
                             search-type="query"
                             searchable
                             :select-index="state.selectedIndex"
                             @update:select-index="handleUpdateSelectIndex"
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
                                :to="{ path: `${state.budgets[rowIndex].budget_id}` }"
                        >
                            {{ value }}
                        </p-link>
                    </div>
                </template>
                <template #col-budget-format="{item, value, rowIndex}">
                    <div class="flex flex-col items-end"
                         :class="{ expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }"
                    >
                        <p>
                            <span>{{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}</span>
                            <span>{{ value }}</span>
                        </p>
                    </div>
                </template>
                <template #col-cycle-format="{value, item}">
                    <p class="flex gap-2 items-center"
                       :class="{ expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }"
                    >
                        <span v-if="value === 'MONTHLY'">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.MONTHLY') }}</span>
                        <span v-else>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.FIXED_TERM') }}</span>
                    </p>
                </template>
                <template #col-period-format="{value, item}">
                    <span :class="{ expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }">{{ value }}</span>
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
                                    workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
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
                    <p :class="{ expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }">
                        {{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}
                        {{ Number(value).toFixed(2) }}
                    </p>
                </template>
                <template #col-utilization-format="{item, value}">
                    <div :class="{ expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }">
                        <div v-if="item.cycle === 'TOTAL' && item.actualSpend > 0">
                            <p-progress-bar :percentage="Number(((Number(item.actualSpend) / Number(item.budget)) * 100).toFixed(2))"
                                            :color="Number(((Number(item.actualSpend) / Number(item.budget)) * 100).toFixed(2)) < 100
                                                && Number(((Number(item.actualSpend) / Number(item.budget)) * 100).toFixed(2)) > 0
                                                ? '#7F9CF5' : '#FF6A6A'"
                            />
                            {{ ((Number(item.actualSpend) / Number(item.budget)) * 100).toFixed(2) }} %
                        </div>
                        <div v-else>
                            <p-progress-bar :percentage="value"
                                            :color="Number(Number(value).toFixed(2)) > 0 && Number(Number(value).toFixed(2)) < 100 ? '#7F9CF5' : '#FF6A6A'"
                            />
                            {{ Number(value).toFixed(2) }} %
                        </div>
                    </div>
                </template>
                <template #col-remaining-format="{item, rowIndex}">
                    <p :class="{exceeded: (Number(item.budget) - Number(item.actualSpend)) < 0, expired: dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD') }">
                        {{ CURRENCY_SYMBOL[state.budgets[rowIndex].currency] }}
                        {{ Math.abs(Number((Number(item.budget) - Number(item.actualSpend)).toFixed(2))) }}
                    </p>
                </template>
                <template #col-state-format="{item}">
                    <div v-if="dayjs(item.period.split('~')[1]).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD')">
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.EXPIRED') }}
                    </div>
                    <p-status v-else
                              theme="green"
                              :text="$t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.ACTIVE_TIL_DATE')"
                    />
                </template>
            </p-toolbox-table>
        </div>
        <p-button-modal header-title="Do you want to On/Off your Alert?" />
        <budget-delete-check-modal :visible="state.modalVisible"
                                   :selected-indices="state.selectedBudgetIds"
                                   @update:visible="state.modalVisible = $event"
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
