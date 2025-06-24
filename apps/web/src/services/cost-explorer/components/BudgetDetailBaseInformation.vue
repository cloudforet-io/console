<script setup lang="ts">
import {
    computed, reactive, watch, watchEffect,
} from 'vue';

import dayjs from 'dayjs';

import {
    PCard, PDefinitionTable, PToggleButton, PLink, PButton, PPaneLayout, PTextInput, PCopyButton,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { CURRENCY_SYMBOL } from '@/store/display/constant';
import { useServiceAccountReferenceStore } from '@/store/reference/service-account-reference-store';

import { showErrorMessage } from '@/lib/helper/notice-alert-helper';

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
} = useBudgetGetQuery(computed(() => props.budgetId));


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
        { name: 'cycle', label: 'Budget Cycle', disableCopy: true },
        { name: 'totalPeriod', label: 'Total Period' },
        { name: 'budgetScope', label: 'Budget Scope', disableCopy: true },
        { name: 'budgetPlan', label: 'Budget Plan', disableCopy: true },
        { name: 'budgetManager', label: 'Budget Manager', disableCopy: true },
        { name: 'budgetAlerts', label: 'Budget Alerts', disableCopy: true },
        { name: 'alertRecipients', label: 'Alert Recipients', disableCopy: true },
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

const { mutate: updateBudgetManager, isPending: isUpdateBudgetManagerPending } = useBudgetUpdateMutation({
    context: {
        type: 'BUDGET_MANAGER',
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        state.budgetManagerEdit = false;
    },
});

const { mutate: updateBudgetPlan, isPending: isUpdateBudgetPlanPending } = useBudgetUpdateMutation({
    context: {
        type: 'BUDGET_PLAN',
    },
    onSuccess: () => {
        invalidateBudgetGetQuery();
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        state.budgetEdit = false;
    },
});

const { mutate: setBudgetAlert, isPending: isSetBudgetAlertPending } = useBudgetSetNotificationMutation({
    context: {
        type: 'BUDGET_ALERTS',
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        state.budgetAlertEdit = false;
    },
});

const { mutate: setAlertRecipients, isPending: isSetAlertRecipientsPending } = useBudgetSetNotificationMutation({
    context: {
        type: 'ALERT_RECIPIENTS',
    },
    onError: (error: any) => {
        showErrorMessage(error.code, error.message);
    },
    onSettled: () => {
        state.alertRecipientsEdit = false;
    },
});

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
    updateBudgetManager({
        budget_id: budgetData.value?.budget_id ?? '',
        budget_manager_id: state.selectedBudgetManager,
    });
};

const handleselectedBudgetThresholds = (value) => {
    state.selectedThresholds = value.map((v) => Number(v.label));
};

const handleChangeToggle = () => {
    state.updateBudgetAlertsModalVisible = true;
};

const handleUpdateAlertRecipients = async () => {
    setAlertRecipients({
        budget_id: props.budgetId,
        notification: {
            ...budgetData.value?.notification,
            recipients: {
                users: state.selectedAlertRecipients,
            },
        },
    });
};

const handleUpdateBudgetThresholds = async () => {
    setBudgetAlert({
        budget_id: props.budgetId,
        notification: {
            ...budgetData.value?.notification,
            plans: state.selectedThresholds.map((threshold) => ({
                unit: 'PERCENT',
                threshold: Number(threshold),
            })),
        },
    });
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
                                custom-key-width="160px"
                                style-type="white"
            >
                <template #data-budgetPlan="{ data }">
                    <div
                        :class="{isEditing: state.budgetEdit && budgetData?.time_unit === 'MONTHLY', 'budget-plan-wrapper-total': budgetData?.time_unit === 'TOTAL',
                                 'budget-plan-total-editing': state.budgetEdit && budgetData?.time_unit === 'TOTAL',
                                 'budget-plan-wrapper': budgetData?.time_unit === 'MONTHLY'}"
                    >
                        <p-pane-layout v-if="budgetData?.time_unit === 'MONTHLY'"
                                       :class="{'budget-plan-monthly-editable': state.budgetEdit, 'budget-plan-monthly-wrapper': !state.budgetEdit && budgetData?.time_unit === 'MONTHLY',
                                                'budget-plan-total-wrapper': !state.budgetEdit && budgetData?.time_unit === 'TOTAL'}"
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
                                                  block
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
                        <div v-else-if="budgetData?.time_unit === 'TOTAL'"
                             class="budget-plan-total-content"
                        >
                            <p v-if="!state.budgetEdit">
                                {{ CURRENCY_SYMBOL[budgetData?.currency ?? ''] }}
                                {{ data.toLocaleString() }}
                            </p>
                            <p-text-input v-else
                                          v-model="state.editableTotalBudgetPlan"
                                          :placeholder="data"
                            />
                        </div>
                        <p-button v-if="!isUpdateBudgetPlanPending && !state.budgetEdit && !storeState.isAdminMode && hasReadWriteAccess"
                                  class="tertiary"
                                  size="sm"
                                  :disabled="dayjs.utc().isBefore(dayjs.utc(budgetData?.start), 'month') && dayjs.utc().isAfter(dayjs.utc(budgetData?.end), 'month')"
                                  @click="state.budgetEdit = true"
                        >
                            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.EDIT') }}
                        </p-button>
                        <div v-if="state.budgetEdit"
                             class="flex gap-2"
                             :class="{'budget-plan-total-editing-button': budgetData?.time_unit === 'TOTAL'}"
                        >
                            <p-button size="sm"
                                      style-type="tertiary"
                                      @click="state.budgetEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button
                                size="sm"
                                :loading="isUpdateBudgetPlanPending"
                                @click="() => {
                                    if (Object.keys(state.editableBudgetPlan).length > 0) {
                                        const newPlannedLimits = Object.entries(state.editableBudgetPlan)
                                            .filter(([, limit]) => limit !== '' && limit !== null && limit !== undefined)
                                            .map(([date, limit]) => ({ date, limit }));
                                        updateBudgetPlan({
                                            budget_id: props.budgetId,
                                            planned_limits: newPlannedLimits.map(({ date, limit }) => ({
                                                date,
                                                limit: Number(limit)
                                            }))
                                        })
                                    } else if (state.editableTotalBudgetPlan) {
                                        const limit = Number(state.editableTotalBudgetPlan);
                                        updateBudgetPlan({
                                            budget_id: props.budgetId,
                                            limit,
                                        })
                                    }
                                }"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE') }}
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
                                class="budget-scope-link"
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
                        <div v-if="!state.budgetManagerEdit"
                             class="flex items-center gap-2"
                        >
                            <span>{{ data }}</span>
                            <p-copy-button v-if="data"
                                           :value="data"
                            />
                        </div>
                        <user-select-dropdown
                            v-else
                            show-user-list
                            :show-user-group-list="false"
                            :show-delete-all-button="false"
                            :selected-id="data"
                            :page-size="3"
                            size="md"
                            @formatted-selected-ids="handleFormatBudgetManager"
                            @update:selected-id="handleSelectBudgetManager"
                        />
                        <p-button v-if="!isUpdateBudgetManagerPending && !state.budgetManagerEdit && !storeState.isAdminMode && hasReadWriteAccess"
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
                                      style-type="tertiary"
                                      @click="state.budgetManagerEdit = false"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                            </p-button>
                            <p-button
                                size="sm"
                                :disabled="!state.budgetManagerEditable"
                                :loading="isUpdateBudgetManagerPending"
                                @click="handleUpdateBudgetManager"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE') }}
                            </p-button>
                        </div>
                    </div>
                </template>
                <template #data-budgetAlerts="{ data }">
                    <div class="budget-alerts-wrapper">
                        <div class="budget-alerts-content flex items-start gap-2">
                            <p-toggle-button :value.sync="state.isBudgetAlertsEnabled"
                                             show-state-text
                                             position="left"
                                             :disabled="storeState.isAdminMode"
                                             :read-only="!state.budgetAlertEdit"
                                             @change-toggle="handleChangeToggle"
                            />
                            <div class="threshold-wrapper">
                                <span class="text-gray-500">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.BUDGET_ALERTS_TEXT') }}:</span>
                                <span v-if="!state.budgetAlertEdit">
                                    {{ data.plans.map(plan => {
                                        return ` ${plan.threshold}${plan.unit === 'PERCENT' ? '%' : ''}`
                                    }).join(', ') }}
                                </span>
                                <div v-if="state.budgetAlertEdit">
                                    <p-text-input appearance-type="stack"
                                                  multi-input
                                                  :selected="data.plans.map(plan => ({
                                                      name: plan.threshold,
                                                      label: Number(plan.threshold)
                                                  }))"
                                                  use-auto-complete
                                                  class="budget-alerts-thresholds"
                                                  @update:selected="handleselectedBudgetThresholds"
                                    >
                                        <template #input-right>
                                            %
                                        </template>
                                    </p-text-input>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p-button v-if="!isSetBudgetAlertPending &&!state.budgetAlertEdit && !storeState.isAdminMode && hasReadWriteAccess"
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
                                          style-type="tertiary"
                                          @click="state.budgetAlertEdit = false"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                                </p-button>
                                <p-button
                                    size="sm"
                                    :loading="isSetBudgetAlertPending"
                                    @click="handleUpdateBudgetThresholds"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE') }}
                                </p-button>
                            </div>
                        </div>
                    </div>
                </template>
                <template #data-alertRecipients="{ data }">
                    <div>
                        <div :class="{isDisplayed: !state.alertRecipientsEdit, 'isEditing': state.alertRecipientsEdit}">
                            <div>
                                <span class="font-medium">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BASE_INFORMATION.ASSIGNED_BUDGET_MANAGER') }}</span>
                                <div v-if="!state.alertRecipientsEdit">
                                    <p
                                        class="flex gap-1 mt-2"
                                    >
                                        <span v-for="(d ,idx) in data"
                                              :key="`${d}-${idx}`"
                                        >
                                            <span v-if="idx === data.length - 1">{{ d }}</span>
                                            <span v-else>{{ d }},</span>
                                        </span>
                                    </p>
                                </div>
                                <user-select-dropdown
                                    v-else
                                    show-user-list
                                    :show-user-group-list="false"
                                    selection-type="multiple"
                                    block
                                    class="mt-2"
                                    :selected-ids="data"
                                    :excluded-selected-ids="[budgetData.budget_manager_id ?? '']"
                                    @update:selected-ids="handleSelectAlertRecipients"
                                />
                            </div>
                            <p-button v-if="!isSetAlertRecipientsPending && !state.alertRecipientsEdit && !storeState.isAdminMode && hasReadWriteAccess"
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
                                          style-type="tertiary"
                                          @click="state.alertRecipientsEdit = false"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CANCEL') }}
                                </p-button>
                                <p-button size="sm"
                                          :loading="isSetAlertRecipientsPending"
                                          @click="handleUpdateAlertRecipients"
                                >
                                    {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SAVE') }}
                                </p-button>
                            </div>
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

.budget-scope-link {
    @apply text-blue-500;
}

.budget-plan-wrapper {
    @apply flex gap-2;

    &.isEditing {
        @screen tablet {
            gap: 1rem;
            align-items: flex-end;
        }
    }
    .budget-plan-monthly-wrapper {
        @apply grid grid-cols-8 gap-4 px-4 py-3 w-full;

        @screen tablet {
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            padding: 0.5rem;
        }

        @screen mobile {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            padding: 0.25rem;
        }
        &.budget-plan-monthly-editable {
            @apply grid-cols-6 w-full;

            @screen tablet {
                grid-template-columns: repeat(3, 1fr);
            }

            @screen mobile {
                grid-template-columns: repeat(2, 1fr);
                gap: 1.5rem;
                padding: 0.25rem;
            }
        }
    }
}

.budget-plan-wrapper-total {
    @apply flex gap-2 justify-between items-center;

    &.budget-plan-total-editing {
        @screen mobile {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .budget-plan-total-editing-button {
            @screen mobile {
                align-self: flex-end;
                margin-top: auto;
            }
        }
    }
}

.budget-alerts-wrapper {
    @apply flex justify-between items-center;
    .budget-alerts-content {
        /* @apply items-center; */
        @screen tablet {
            flex-direction: column;
        }
        .threshold-wrapper {
            @apply flex gap-2 items-start;

            @screen tablet {
                /* flex gap-2 items-start */
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .budget-alerts-thresholds {
                @screen tablet {
                    &.p-text-input {
                        width: 13.125rem;
                    }
                }
            }
        }
        .budget-alerts-button-wrapper {
            @screen tablet {
                display: flex;
                flex-direction: column-reverse;
                gap: 0.5rem;
            }

            @screen mobile {
                display: flex;
                flex-direction: column-reverse;
                gap: 0.5rem;
            }
        }
    }
}

.overflow {
    @apply grid grid-rows-2;
}

.isDisplayed {
    @apply flex justify-between items-center;

    @screen tablet {
        align-items: flex-start;
    }
}

.isEditing {
    @apply flex flex-col gap-1.5;

    /* align-items: start; */
    justify-content: space-between;

    > *:last-child {
        align-self: end;
    }

    min-height: 240px;

    @screen tablet {
        align-items: flex-end;
    }
}
</style>

