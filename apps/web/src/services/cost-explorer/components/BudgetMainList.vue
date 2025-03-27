<script lang="ts" setup>
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
    PToolboxTable, PSelectDropdown, PToggleButton, PButtonModal, PI, PProgressBar, PStatus, PLink,
} from '@cloudforet/mirinae';


import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { BudgetUsageModel } from '@/api-clients/cost-analysis/budget-usage/schema/model';
import type { BudgetListParameters } from '@/api-clients/cost-analysis/budget/schema/api-verbs/list';
import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';

import type { ListResponse } from '@/lib/variable-models/_base/types';

import ErrorHandler from '@/common/composables/error/errorHandler';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';

import BudgetMainToolset from '@/services/cost-explorer/components/BudgetMainToolset.vue';


import type { Period } from '../types/cost-explorer-query-type';
import BudgetDeleteCheckModal from './BudgetDeleteCheckModal.vue';


const serviceAccountReferenceStore = useServiceAccountReferenceStore();

interface Props {
  modalVisible: boolean;
}

interface BudgetMainListState {
    budgets: BudgetModel[];
    budgetUsages: BudgetUsageModel[];
    budgetTotalInfo: (BudgetModel & BudgetUsageModel)[];
    more: boolean;
    loading: boolean;
    modalVisible: boolean;
    queryFilters: ConsoleFilter[];
    pageStart: number;
    pageLimit: number;
    period: Period;
    sort: Query['sort'];
    query: any;
}

const props = withDefaults(defineProps<Props>(), {
    modalVisible: false,
});

const currentRoute = SpaceRouter.router.currentRoute;
const queryHelper = new QueryHelper();
const budgetUsageApiQueryHelper = new ApiQueryHelper();

const appContextStore = useAppContextStore();

const emit = defineEmits<{(e: 'update:select-month-modal-visible', value: boolean): void;}>();

const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

const state = reactive<BudgetMainListState>({
    budgets: [],
    budgetUsages: [],
    budgetTotalInfo: [],
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
});

const tableState = reactive({
    fields: computed(() => [
        {
            name: 'name',
            label: 'Name',
            width: '14%',
        },
        {
            name: 'cycle',
            label: 'Cycle',
            width: '7%',
        },
        {
            name: 'period',
            label: 'Period',
            width: '7%',
        },
        {
            name: 'scope',
            label: 'Scope',
            width: '14%',
        },
        {
            name: 'plannedBudget',
            label: 'Planned Budget',
            width: '12%',
        },
        {
            name: 'actualSpend',
            label: 'Actual Spend',
            width: '12%',
        },
        {
            name: 'budgetStatus',
            label: 'Budget Status',
            width: '12%',
        },
        {
            name: 'alert',
            label: 'Alert',
            width: '10%',
        },
        {
            name: 'state',
            label: 'State',
            width: '10.5%',
        },
    ]),
    items: computed(() => state.budgetTotalInfo.map((budget) => ({
        name: budget.name,
        cycle: budget.time_unit === 'MONTHLY' ? 'Monthly' : 'FixedTerm',
        period: budget.time_unit === 'MONTHLY'
            ? budget.planned_limits
                .filter((planned_limit) => dayjs.utc(planned_limit.date).format('MM') === dayjs.utc(budget.date).format('MM'))
                .map((filtered_limit) => `${dayjs.utc(filtered_limit.date).startOf('month').format('YYYY-MM-DD')} ~ ${dayjs.utc(filtered_limit.date).endOf('month').format('YYYY-MM-DD')}`)[0]
            : `${dayjs.utc(budget.start).format('YYYY-MM-DD')} ~ ${dayjs.utc(budget.end).format('YYYY-MM-DD')}`,
        scope: budget.service_account_id ? budget.service_account_id : budget.project_id,
        plannedBudget: budget.limit,
        actualSpend: budget.cost,
        budgetStatus: budget.limit - budget.cost,
        alerts: budget.notifications.state,
        state: 'budget',
    }))),
    actionMenus: [
        { name: 'edit', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.EDIT') },
        { name: 'delete', label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.DELETE') },
    ],
    selectedActionItem: '',
    selectedIndex: [] as number[],
});

const budgetApiQueryHelper = new ApiQueryHelper()
    .setPage(state.pageStart, state.pageLimit);

const handleModalVisible = (visible: boolean) => {
    emit('update:select-month-modal-visible', visible);
};

interface BudgetQuery {
    budgetUsed: string|undefined;
    cycle: string|undefined;
    period: string|undefined;
    projectList: string[];
    serviceAccountList: any[];
}

const handleQuery = (query: BudgetQuery) => {
    state.query = query;
};

const handleChangeToggle = () => {};

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
        return await SpaceConnector.clientV2.costAnalysis.budgetUsage.list({});
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
            // ...budgetUsageApiQueryHelper.data,
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
    tableState.selectedIndex = indicies;
};

/* Watcher */
watch(() => state.query, () => {
    // TODO:
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
    if (state.query.projectList.length > 0 || state.query.serviceAccountList) {
        await fetchBudgets();
        // await listBudgetUsages();
    }
}, { deep: true, immediate: true });

watch([() => state.budgetUsages, () => state.budgets], () => {
    state.budgets.forEach((budget) => {
        state.budgetUsages.forEach((budgetUsage) => {
            if (budget.budget_id === budgetUsage.budget_id) {
                if (budget.time_unit === 'MONTHLY') {
                    state.budgetTotalInfo.push({
                        ...budget,
                        ...budgetUsage,
                    });
                } else {
                    const existingBudget = state.budgetTotalInfo.find((info) => info.budget_id === budget.budget_id);
                    if (existingBudget) {
                        existingBudget.cost = (existingBudget.cost || 0) + (budgetUsage.cost || 0);
                    } else {
                        state.budgetTotalInfo.push({
                            ...budget,
                            ...budgetUsage,
                        });
                    }
                }
            }
        });
    });
}, { immediate: true, deep: true });

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
                             pagination-visible
                             exportable
                             search-type="query"
                             searchable
                             :select-index="tableState.selectedIndex"
                             @update:select-index="handleUpdateSelectIndex"
            >
                <template #toolbox-left>
                    <p-select-dropdown placeholder="Action"
                                       :menu="tableState.actionMenus"
                                       :selected.sync="tableState.selectedActionItem"
                    />
                </template>
                <template #col-name-format="{value, rowIndex}">
                    <div class="flex flex-col gap-5">
                        <p-link highlight>
                            {{ value }}
                        </p-link>
                        <div>
                            <p-progress-bar v-if="(state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100 >= 100"
                                            color="#FF6A6A"
                                            :percentage="Number(((state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100).toFixed(2))"
                            />
                            <p-progress-bar v-else-if="(state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100 >= 90
                                                && (state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100 <100"
                                            color="#FFCE02"
                                            :percentage="Number(((state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100).toFixed(2))"
                            />
                            <p-progress-bar v-else
                                            color="#7F9CF5"
                                            :percentage="Number(((state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100).toFixed(2))"
                            />
                            <span>{{ Number(((state.budgetTotalInfo[rowIndex].cost / state.budgetTotalInfo[rowIndex].limit) * 100).toFixed(2)) }} %</span>
                        </div>
                    </div>
                </template>
                <template #col-plannedBudget-format="{value, rowIndex}">
                    <div class="flex flex-col items-end">
                        <p>
                            <span>{{ CURRENCY_SYMBOL[state.budgetTotalInfo[rowIndex].currency] }}</span>
                            <span>{{ value }}</span>
                        </p>
                        <span>({{ state.budgetTotalInfo[rowIndex].currency }})</span>
                        <div class="h-12" />
                    </div>
                </template>
                <template #col-cycle-format="{value}">
                    <p class="flex gap-2 items-center">
                        <p-i v-if="value === 'Monthly'"
                             name="ic_renew"
                             width="1rem"
                             height="1rem"
                        />
                        <span>{{ value }}</span>
                    </p>
                    <div class="h-12" />
                </template>
                <template #col-period-format="{value}">
                    <span>{{ value }}</span>
                    <div class="h-12" />
                </template>
                <template #col-scope-format="{value}">
                    <div v-if="value.startsWith('project-')">
                        <p-i name="ic_service_project" />
                        <project-link-button :project-id="value" />
                    </div>
                    <p-link v-else
                            :text="value"
                            action-icon="internal-link"
                            new-tab
                            icon-left="ic_service_security"
                    >
                        <span>Service Account: </span>
                        <span>{{ getServiceAccountName(value) }}</span>
                    </p-link>
                    <div class="h-12" />
                </template>
                <template #col-actualSpend-format="{value, rowIndex}">
                    <div class="flex flex-col items-end">
                        <p>
                            <span>{{ CURRENCY_SYMBOL[state.budgetTotalInfo[rowIndex].currency] }}</span>
                            <span>{{ value }}</span>
                        </p>
                        <span>({{ state.budgetTotalInfo[rowIndex].currency }})</span>
                    </div>
                    <div class="h-12" />
                </template>
                <template #col-budgetStatus-format="{value, rowIndex}">
                    <div>
                        <div v-if="value < 0"
                             class="flex items-center justify-end gap-2.5"
                        >
                            <p-i name="ic_arrow-up-bold-alt"
                                 width="0.75rem"
                            />
                            <p class="flex flex-col items-end text-red-500">
                                <span class="flex items-center">
                                    <span>-</span>
                                    {{ CURRENCY_SYMBOL[state.budgetTotalInfo[rowIndex].currency] + (value * -1).toFixed(2) }}
                                </span>
                                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.EXCEEDED') }}</span>
                            </p>
                        </div>
                        <div v-else-if="value >= 0">
                            <p class="flex flex-col items-end">
                                <span>{{ CURRENCY_SYMBOL[state.budgetTotalInfo[rowIndex].currency] + value.toFixed(2) }}</span>
                                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.MAIN.REMAINED') }}</span>
                            </p>
                        </div>
                        <div class="h-12" />
                    </div>
                </template>
                <template #col-alert-format="{value}">
                    <div class="flex flex-col">
                        <span>{{ value }}</span>
                        <p-toggle-button :value="value === 'ENABLED' ? true : false"
                                         show-state-text
                                         position="left"
                                         class="mr-8"
                                         @change-toggle="handleChangeToggle"
                        />
                        <div class="h-12" />
                    </div>
                </template>
                <template #col-state-format="{value}">
                    <p-status v-if="value === 'Active'"
                              theme="green"
                              :text="value"
                    />
                    <span v-else>{{ value }}</span>
                    <div class="h-12" />
                </template>
            </p-toolbox-table>
        </div>
        <p-button-modal header-title="Do you want to On/Off your Alert?" />
        <budget-delete-check-modal :visible="tableState.selectedActionItem === 'delete'" />
    </div>
</template>
