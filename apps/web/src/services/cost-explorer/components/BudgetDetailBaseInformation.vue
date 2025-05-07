<script setup lang="ts">
import {
    computed, reactive, watch, watchEffect,
} from 'vue';

import dayjs from 'dayjs';

import {
    PCard, PDefinitionTable, PToggleButton, PLink, PButton, PPaneLayout, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import ProjectLinkButton from '@/common/modules/project/ProjectLinkButton.vue';
import UserSelectDropdown from '@/common/modules/user/UserSelectDropdown.vue';

import BudgetAlertsModal from '@/services/cost-explorer/components/BudgetAlertsModal.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';


const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const serviceAccountReferenceStore = useServiceAccountReferenceStore();
const appContextStore = useAppContextStore();

const getServiceAccountName = (serviceAccountId: string): string|undefined => serviceAccountReferenceStore.getters.serviceAccountItems[serviceAccountId]?.label;

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    budgetData: computed(() => budgetPageState.budgetData),
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});

const state = reactive({
    definitionFields: [
        { name: 'cycle', label: 'Budget Cycle' },
        { name: 'totalPeriod', label: 'Total Period' },
        { name: 'budgetScope', label: 'Budget Scope' },
        { name: 'budgetPlan', label: 'Budget Plan' },
        { name: 'budgetManager', label: 'Budget Manager' },
        { name: 'budgetAlerts', label: 'Budget Alerts' },
        { name: 'alertRecipients', label: 'Alert Recipients' },
    ],
    definitionData: computed(() => ({
        cycle: storeState.budgetData?.time_unit === 'MONTHLY' ? i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY') : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM'),
        totalPeriod: `${storeState.budgetData?.start} ~ ${storeState.budgetData?.end}`,
        budgetScope: storeState.budgetData?.service_account_id ?? storeState.budgetData?.project_id,
        budgetPlan: storeState.budgetData?.time_unit === 'MONTHLY' ? storeState.budgetData.planned_limits : storeState.budgetData?.limit,
        budgetManager: storeState.budgetData?.budget_manager_id,
        budgetAlerts: storeState.budgetData?.notification.plans
            && storeState.budgetData?.notification.plans?.length > 0 ? storeState.budgetData?.notification : {
                state: 'DISABLED',
                plans: [],
            },
        alertRecipients: storeState.budgetData?.notification.recipients?.users,
    })),
    isBudgetAlertsEnabled: computed(() => (storeState.budgetData?.notification.state === 'ENABLED')),
    updateBudgetAlertsModalVisible: false,
    budgetAlertEdit: false,
    budgetEdit: false,
    budgetManagerEdit: false,
    alertRecipientsEdit: false,
    editableTotalBudgetPlan: '',
    editableBudgetPlan: {},
    selectedBudgetManager: '',
    selectedThresholds: [] as MenuItem[],
    selectedAlertRecipients: [] as string[],
    budgetManagerEditable: false,
});

const handleUpdateBudgetAlerts = async (value: boolean) => {
    state.updateBudgetAlertsModalVisible = value;
    await budgetPageStore.getBudgetData(budgetPageState.budgetData?.budget_id ?? '');
};

const updateBudget = async (updateParams: any, type: string) => {
    if (storeState.budgetData?.budget_id) {
        await budgetPageStore.updateBudgetData({
            budgetId: storeState.budgetData?.budget_id,
            updateParams,
        }, type);
    }
};

const updateBudgetInfo = async (type: string, data: any) => {
    try {
        await updateBudget({
            ...data,
        }, type);
    } finally {
        if (type === 'budgetManager') {
            state.budgetManagerEdit = false;
        } else if (type === 'budgetPlan') {
            state.budgetEdit = false;
        }
    }
};

const handleSelectBudgetManager = (userId: string|undefined) => {
    if (userId) state.selectedBudgetManager = userId;
};

const handleSelectAlertRecipients = (userIds: string[]) => {
    state.selectedAlertRecipients = userIds;
};

const handleUpdateBudgetManager = () => {
    updateBudgetInfo('budgetManager', { budget_manager_id: state.selectedBudgetManager });
};

const handleselectedBudgetThresholds = (value) => {
    state.selectedThresholds = value.map((v) => Number(v.label));
};

const handleUpdateAlertRecipients = async () => {
    try {
        await budgetPageStore.updateBudgetNotifications({
            budget_id: storeState.budgetData?.budget_id ?? '',
            notification: {
                ...storeState.budgetData?.notification,
                recipients: {
                    users: state.selectedAlertRecipients,
                },
            },
        }, 'budgetThreshold');
        state.alertRecipientsEdit = false;
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
            data: 'alertRecipients'.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        }), '');
    } catch (error: any) {
        showErrorMessage(error.code, error.message);
    }
};

const handleUpdateBudgetThresholds = async () => {
    await budgetPageStore.updateBudgetNotifications({
        budget_id: storeState.budgetData?.budget_id ?? '',
        notification: {
            ...storeState.budgetData?.notification,
            plans: state.selectedThresholds.map((threshold) => ({
                unit: 'PERCENT',
                threshold: Number(threshold),
            })),
        },
    }, 'budgetAlerts');
    state.budgetAlertEdit = false;
};

const handleFormatBudgetManager = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        state.selectedBudgetManager = '';
    }
};

watchEffect(() => {
    if (storeState.budgetData?.planned_limits && storeState.budgetData.time_unit === 'MONTHLY') {
        const map: Record<string, number> = {};
        storeState.budgetData.planned_limits.forEach((item: { date: string; limit: number }) => {
            map[item.date] = item.limit;
        });
        state.editableBudgetPlan = map;
    }
});

watch(() => state.selectedBudgetManager, (nv, ov) => {
    if (state.selectedBudgetManager === '' || nv === ov) {
        state.budgetManagerEditable = false;
    } else if (state.selectedBudgetManager !== '' && nv !== ov) {
        state.budgetManagerEditable = true;
    }
}, { deep: true, immediate: true });
</script>

<template>
    <div>
        <p-card size="lg"
                style-type="white"
                :header="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.TITLE')"
        >
            <p-definition-table class="mb-10"
                                :fields="state.definitionFields"
                                :data="state.definitionData"
                                block
                                disable-copy
                                custom-key-width="160px"
                                style-type="white"
            >
                <template #data-budgetPlan="{ data }">
                    <div class="flex justify-between">
                        <p-pane-layout v-if="budgetPageState.budgetData?.time_unit === 'MONTHLY'"
                                       class="grid grid-cols-4 gap-6 px-4 py-3 min-w-[62rem]"
                        >
                            <div v-for="(dateInfo, idx) in data"
                                 :key="`date-info-${idx}`"
                                 :class="{overflow: data.length > 12}"
                            >
                                <p class="flex flex-col gap-2">
                                    <span class="font-bold text-xs text-gray-600">
                                        {{ dayjs.utc(dateInfo.date).format('MMM YYYY') }}
                                    </span>
                                    <span v-if="!state.budgetEdit">
                                        {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? ''] }}
                                        {{ dateInfo.limit.toLocaleString() }}
                                    </span>
                                    <p-text-input v-else
                                                  v-model="state.editableBudgetPlan[dateInfo.date]"
                                                  class="budget-plan-monthly"
                                                  :placeholder="dateInfo.limit"
                                                  :disabled="dayjs.utc(dateInfo.date).isBefore(dayjs.utc().startOf('month'))"
                                    >
                                        <template #input-right>
                                            {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? ''] }}
                                        </template>
                                    </p-text-input>
                                </p>
                            </div>
                        </p-pane-layout>
                        <div v-else-if="budgetPageState.budgetData?.time_unit === 'TOTAL'">
                            <p v-if="!state.budgetEdit">
                                {{ CURRENCY_SYMBOL[budgetPageState.budgetData?.currency ?? ''] }}
                                {{ data.toLocaleString() }}
                            </p>
                            <p-text-input v-else
                                          v-model="state.editableTotalBudgetPlan"
                                          :placeholder="data"
                            />
                        </div>
                        <p-button v-if="!state.budgetEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  @click="state.budgetEdit = true"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.EDIT') }}
                        </p-button>
                        <div v-if="state.budgetEdit"
                             class="flex gap-2"
                        >
                            <p-button size="sm"
                                      style-type="transparent"
                                      @click="state.budgetEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button
                                size="sm"
                                @click="() => {
                                    if (Object.keys(state.editableBudgetPlan).length > 0) {
                                        const newPlannedLimits = Object.entries(state.editableBudgetPlan)
                                            .filter(([, limit]) => limit !== '' && limit !== null && limit !== undefined)
                                            .map(([date, limit]) => ({ date, limit }));
                                        updateBudgetInfo('budgetPlan', { planned_limits: newPlannedLimits })
                                    } else if (state.editableTotalBudgetPlan) {
                                        const limit = state.editableTotalBudgetPlan;
                                        updateBudgetInfo('budgetPlan', { limit })
                                    }
                                }"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE_CHANGES') }}
                            </p-button>
                        </div>
                    </div>
                </template>
                <template #data-budgetScope="{ data }">
                    <div>
                        <div v-if="data.startsWith('project-')">
                            <project-link-button :project-id="data"
                                                 highlight
                            />
                        </div>
                        <div v-else-if="data.startsWith('sa-')">
                            <p-link
                                :text="getServiceAccountName(data)"
                                action-icon="external-link"
                                new-tab
                                :to="{
                                    name: SERVICE_ACCOUNT_ROUTE.DETAIL._NAME,
                                    params: {
                                        serviceAccountId: budgetPageState.budgetData?.service_account_id ?? ''
                                    }
                                }"
                                highlight
                            />
                        </div>
                    </div>
                </template>
                <template #data-budgetManager="{ data }">
                    <div
                        :class="{isDisplayed: !state.budgetManagerEdit ,isEditing: state.budgetManagerEdit}"
                    >
                        <span v-if="!state.budgetManagerEdit">{{ data }}</span>
                        <user-select-dropdown
                            v-else
                            show-user-list
                            :show-delete-all-button="false"
                            :selected-id="data"
                            :page-size="3"
                            @formatted-selected-ids="handleFormatBudgetManager"
                            @update:selected-id="handleSelectBudgetManager"
                        />
                        <p-button v-if="!state.budgetManagerEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  @click="state.budgetManagerEdit = true"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.EDIT') }}
                        </p-button>
                        <div v-else-if="state.budgetManagerEdit && !storeState.isAdminMode && hasReadWriteAccess"
                             class="flex gap-2"
                        >
                            <p-button size="sm"
                                      style-type="transparent"
                                      @click="state.budgetManagerEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button
                                size="sm"
                                :disabled="!state.budgetManagerEditable"
                                @click="handleUpdateBudgetManager"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE_CHANGES') }}
                            </p-button>
                        </div>
                    </div>
                </template>
                <template #data-budgetAlerts="{ data }">
                    <div
                        class="flex justify-between"
                    >
                        <div class="flex items-start gap-2">
                            <p-toggle-button :value.sync="state.isBudgetAlertsEnabled"
                                             show-state-text
                                             position="left"
                                             :disabled="storeState.isAdminMode"
                                             @change-toggle="() => {
                                                 state.updateBudgetAlertsModalVisible = true;
                                             }"
                            />
                            <div class="flex gap-2 items-start">
                                <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.BUDGET_ALERTS_TEXT', {
                                    threshold: [...data.plans].sort((a, b) => a.threshold - b.threshold).map(plan => {
                                        return ` ${plan.threshold}${plan.unit === 'PERCENT' ? '%' : ''}`
                                    })
                                }) }}</span>
                                <div v-if="state.budgetAlertEdit">
                                    <p-text-input appearance-type="stack"
                                                  multi-input
                                                  :selected="data.plans.map(plan => ({
                                                      name: plan.threshold,
                                                      label: Number(plan.threshold)
                                                  }))"
                                                  class="budget-alerts-thresholds"
                                                  @update:selected="handleselectedBudgetThresholds"
                                    >
                                        <template #input-right>
                                            (%)
                                        </template>
                                    </p-text-input>
                                </div>
                            </div>
                        </div>
                        <p-button v-if="!state.budgetAlertEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  @click="state.budgetAlertEdit = true"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.EDIT') }}
                        </p-button>
                        <div v-else-if="state.budgetAlertEdit && !storeState.isAdminMode && hasReadWriteAccess"
                             class="flex gap-2 items-end"
                        >
                            <p-button size="sm"
                                      style-type="transparent"
                                      @click="state.budgetAlertEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button
                                size="sm"
                                @click="handleUpdateBudgetThresholds"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE_CHANGES') }}
                            </p-button>
                        </div>
                    </div>
                </template>
                <template #data-alertRecipients="{ data }">
                    <div :class="{isDisplayed: !state.alertRecipientsEdit, isEditing: state.alertRecipientsEdit}">
                        <p v-if="!state.alertRecipientsEdit"
                           class="flex gap-1"
                        >
                            <span v-for="(d ,idx) in data"
                                  :key="`${d}-${idx}`"
                            >
                                <span v-if="idx === data.length - 1">{{ d }}</span>
                                <span v-else>{{ d }},</span>
                            </span>
                        </p>
                        <user-select-dropdown
                            v-else
                            show-user-list
                            selection-type="multiple"
                            :selected-ids="data"
                            :excluded-selected-ids="[budgetPageState.budgetData?.budget_manager_id ?? '']"
                            @update:selected-ids="handleSelectAlertRecipients"
                        />
                        <p-button v-if="!state.alertRecipientsEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  @click="state.alertRecipientsEdit = true"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.EDIT') }}
                        </p-button>
                        <div v-else-if="state.alertRecipientsEdit && !storeState.isAdminMode && hasReadWriteAccess"
                             class="flex gap-2"
                        >
                            <p-button size="sm"
                                      style-type="transparent"
                                      @click="state.alertRecipientsEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button size="sm"
                                      @click="handleUpdateAlertRecipients"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE_CHANGES') }}
                            </p-button>
                        </div>
                    </div>
                </template>
            </p-definition-table>
        </p-card>
        <budget-alerts-modal :visible="state.updateBudgetAlertsModalVisible"
                             :budget-on-off-value="state.isBudgetAlertsEnabled"
                             @update:visible="handleUpdateBudgetAlerts"
        />
    </div>
</template>

<style scoped lang="postcss">
.p-pane-layout {
    @apply bg-gray-100;
}

.p-context-menu-item {
    position: absolute;
    z-index: 1000;
}

.budget-plan-monthly {
    &.p-text-input {
        width: 10rem;
    }
}

.budget-alerts-thresholds {
    &.p-text-input {
        width: 13.125rem;
    }
}

.overflow {
    @apply grid grid-rows-2;
}

.isDisplayed {
    @apply flex justify-between items-center;
}

.isEditing {
    @apply flex flex-col justify-between items-end gap-1.5;
    min-height: 240px;
}
</style>
