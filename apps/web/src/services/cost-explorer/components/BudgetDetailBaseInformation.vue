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
import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';
import { useBudgetSetNotificationMutation } from '@/services/cost-explorer/composables/use-budget-set-notification-mutation';
import { useBudgetUpdateMutation } from '@/services/cost-explorer/composables/use-budget-update-mutation';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';



interface Props {
    budgetId: string;
}

const props = defineProps<Props>();

const {
    budgetData: _budgetData, isFetching, invalidateBudgetGetQuery,
} = useBudgetGetQuery(props.budgetId);


const serviceAccountReferenceStore = useServiceAccountReferenceStore();
const appContextStore = useAppContextStore();

const getServiceAccountName = (serviceAccountId: string): string|undefined => serviceAccountReferenceStore.getters.serviceAccountItems[serviceAccountId]?.label;

const { hasReadWriteAccess } = usePageEditableStatus();


const storeState = reactive({
    isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
});

const budgetData = computed(() => _budgetData.value);

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
        cycle: budgetData.value?.time_unit === 'MONTHLY' ? i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.MONTHLY') : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.CREATE.FIXED_TERM'),
        totalPeriod: `${budgetData.value?.start} ~ ${budgetData.value?.end}`,
        budgetScope: budgetData.value?.service_account_id ?? budgetData.value?.project_id,
        budgetPlan: budgetData.value?.time_unit === 'MONTHLY' ? budgetData.value.planned_limits : budgetData.value?.limit,
        budgetManager: budgetData.value?.budget_manager_id,
        budgetAlerts: budgetData.value?.notification.plans
            && budgetData.value?.notification.plans?.length > 0 ? budgetData.value?.notification : {
                state: 'DISABLED',
                plans: [],
            },
        alertRecipients: budgetData.value?.notification.recipients?.users,
    })),
    isBudgetAlertsEnabled: computed(() => (budgetData.value?.notification?.state === 'ENABLED')),
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

const { mutate: _updateBudget, isPending: isUpdateBudgetPending } = useBudgetUpdateMutation({
    onSuccess: (_d, _v, __mutationType) => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
            data: __mutationType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        }), '');
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
});

const { mutate: setNotification, isPending: isSetNotificationPending } = useBudgetSetNotificationMutation({
    onSuccess: (_data, _variables, __mutationType) => {
        showSuccessMessage(i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.UPDATE_SUCCESS', {
            data: __mutationType.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        }), '');
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
});

const updateBudget = async (updateParams: any, type: string) => {
    if (budgetData.value?.budget_id) {
        _updateBudget({
            ...updateParams,
            budget_id: budgetData.value?.budget_id,
            __mutationType: type,
        });
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

const handleUpdateBudgetAlerts = async (value: boolean) => {
    if (!value) {
        state.updateBudgetAlertsModalVisible = value;
    } else {
        invalidateBudgetGetQuery();
        state.updateBudgetAlertsModalVisible = false;
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

const handleChangeToggle = () => {
    state.updateBudgetAlertsModalVisible = true;
};

const handleUpdateAlertRecipients = async () => {
    setNotification({
        budget_id: budgetData.value?.budget_id ?? '',
        notification: {
            ...budgetData.value?.notification,
            recipients: {
                users: state.selectedAlertRecipients,
            },
        },
        __mutationType: 'alertRecipients',
    });

    state.alertRecipientsEdit = false;
};

const handleUpdateBudgetThresholds = async () => {
    setNotification({
        budget_id: budgetData.value?.budget_id ?? '',
        notification: {
            ...budgetData.value?.notification,
            plans: state.selectedThresholds.map((threshold) => ({
                unit: 'PERCENT',
                threshold: Number(threshold),
            })),
        },
        __mutationType: 'budgetAlerts',
    });

    state.budgetAlertEdit = false;
};

const handleFormatBudgetManager = (value: Record<string, any>) => {
    if (Array.isArray(value.USER) && value.USER.length === 0) {
        state.selectedBudgetManager = '';
    }
};

watchEffect(() => {
    if (budgetData.value?.planned_limits && budgetData.value.time_unit === 'MONTHLY') {
        const map: Record<string, number> = {};
        budgetData.value.planned_limits.forEach((item: { date: string; limit: number }) => {
            map[item.date] = item.limit;
        });
        state.editableBudgetPlan = map;
    }
});

watch(() => state.selectedBudgetManager, (nv, ov) => {
    if (nv === ov) {
        state.budgetManagerEditable = false;
    } else if (state.selectedBudgetManager === '' || nv !== ov) {
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
            <p-definition-table v-if="!isFetching && budgetData?.budget_id"
                                class="mb-10"
                                :fields="state.definitionFields"
                                :data="state.definitionData"
                                block
                                disable-copy
                                custom-key-width="160px"
                                style-type="white"
            >
                <template #data-budgetPlan="{ data }">
                    <div class="flex justify-between items-center">
                        <p-pane-layout v-if="budgetData?.time_unit === 'MONTHLY'"
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
                                        {{ CURRENCY_SYMBOL[budgetData?.currency ?? ''] }}
                                        {{ dateInfo.limit.toLocaleString() }}
                                    </span>
                                    <p-text-input v-else
                                                  v-model="state.editableBudgetPlan[dateInfo.date]"
                                                  class="budget-plan-monthly"
                                                  :placeholder="dateInfo.limit"
                                                  :disabled="dayjs.utc(dateInfo.date).isBefore(dayjs.utc().startOf('month'))"
                                    >
                                        <template #input-right>
                                            {{ CURRENCY_SYMBOL[budgetData?.currency ?? ''] }}
                                        </template>
                                    </p-text-input>
                                </p>
                            </div>
                        </p-pane-layout>
                        <div v-else-if="budgetData?.time_unit === 'TOTAL'">
                            <p v-if="!state.budgetEdit">
                                {{ CURRENCY_SYMBOL[budgetData?.currency ?? ''] }}
                                {{ data.toLocaleString() }}
                            </p>
                            <p-text-input v-else
                                          v-model="state.editableTotalBudgetPlan"
                                          :placeholder="data"
                            />
                        </div>
                        <p-button v-if="!isUpdateBudgetPending && !state.budgetEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  :disabled="dayjs.utc().isBefore(dayjs.utc(budgetData?.start), 'month') && dayjs.utc().isAfter(dayjs.utc(budgetData?.end), 'month')"
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
                                :loading="isUpdateBudgetPending"
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
                                        serviceAccountId: budgetData?.service_account_id ?? ''
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
                            :show-user-group-list="false"
                            :show-delete-all-button="false"
                            :selected-id="data"
                            :page-size="3"
                            @formatted-selected-ids="handleFormatBudgetManager"
                            @update:selected-id="handleSelectBudgetManager"
                        />
                        <p-button v-if="!isUpdateBudgetPending && !state.budgetManagerEdit && !storeState.isAdminMode && hasReadWriteAccess"
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
                                :loading="isUpdateBudgetPending"
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
                                             @change-toggle="handleChangeToggle"
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
                        <p-button v-if="!isSetNotificationPending &&!state.budgetAlertEdit && !storeState.isAdminMode && hasReadWriteAccess"
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
                                :loading="isSetNotificationPending"
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
                            :show-user-group-list="false"
                            selection-type="multiple"
                            :selected-ids="data"
                            :excluded-selected-ids="[budgetData.budget_manager_id ?? '']"
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
                             :budget-id="budgetId"
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
