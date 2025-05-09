<script setup lang="ts">
import { computed, reactive } from 'vue';

import { cloneDeep } from 'lodash';

import {
    PButtonModal, PTextInput, PButton, PSelectDropdown, PIconButton, PRadioGroup, PRadio,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';
import type { BudgetNotificationsTargetType } from '@/services/cost-explorer/types/budget-form-type';

type BudgetNotification = BudgetModel['notifications'][number];
interface ConditionUnitMenuItem extends SelectDropdownMenuItem {
    name: BudgetNotification['unit'];
}
interface ConditionTypeMenuItem extends SelectDropdownMenuItem {
    name: BudgetNotification['notification_type'];
}
interface Props {
    visible?: boolean;
    budgetTargetId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetTargetId: undefined,
});

const emit = defineEmits<{(e: 'confirm'): void; }>();

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const createDefaultNotification = (unit = 'ACTUAL_COST', threshold = null, notificationType = 'WARNING') => ({
    unit,
    threshold,
    notification_type: notificationType,
});

const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    notifications: (cloneDeep(budgetPageState.budgetData?.notifications) ?? Array.from({ length: 2 }, () => createDefaultNotification())) as BudgetNotification[],
    units: computed<ConditionUnitMenuItem[]>(() => ([
        {
            name: 'ACTUAL_COST',
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ACTUAL_COST'),
        },
        {
            name: 'PERCENT',
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_USAGE', { symbol: '%' }),
        },
    ])),
    types: computed<ConditionTypeMenuItem[]>(() => ([
        {
            name: 'WARNING',
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.WARNING'),
        },
        {
            name: 'CRITICAL',
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CRITICAL'),
        },
    ])),
    budgetId: computed(() => budgetPageState.budgetData?.budget_id),
    thresholdValidations: budgetPageState.budgetData?.notifications?.map((d) => !!d) ?? [] as Array<boolean|undefined>,
    isAllValid: computed(() => state.thresholdValidations.every((d) => !!d)),
    radioMenuList: computed<BudgetNotificationsTargetType[]>(() => ([
        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ALL_MEMBER'),
            name: 'ALL',
        },
        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.USER_GROUP'),
            name: 'USER_GROUP',
        },

        {
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SPECIFIC_USER'),
            name: 'USER',
        },
    ])),
    proxySelectedRadioIdx: 0,
});

const handleAddCondition = () => {
    state.notifications.push({
        unit: 'ACTUAL_COST',
        threshold: null,
        notification_type: 'WARNING',
    });
    state.thresholdValidations.push(undefined);
};

const handleDeleteCondition = (idx) => {
    const notifications = [...state.notifications];
    notifications.splice(idx, 1);
    state.thresholdValidations.splice(idx, 1);
    state.notifications = notifications;
};

const handleThresholdInput = (idx, threshold?: string) => {
    let isValid;
    const numberThreshold = Number(threshold);
    if (!threshold || Number.isNaN(numberThreshold)) isValid = false;
    else if (numberThreshold < 0) isValid = false;
    else isValid = !(state.notifications[idx]?.unit === 'PERCENT' && numberThreshold > 100);
    state.thresholdValidations.splice(idx, 1, isValid);
    const notifications = [...state.notifications];
    notifications[idx].threshold = threshold;
    state.notifications = notifications;
};

const setBudgetAlert = async () => {
    try {
        state.notifications = state.notifications.map((notification: BudgetNotification) => ({
            ...notification,
            threshold: Number(notification.threshold),
        }));
        budgetPageStore.updateBudgetNotifications({
            budgetId: state.budgetId,
            notifications: state.notifications,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const handleUpdateNotificationType = (idx, type) => {
    const notifications = [...state.notifications];
    notifications[idx].notification_type = type;
    state.notifications = notifications;
};

const handleUpdateUnit = (idx, unit) => {
    const notifications = [...state.notifications];
    notifications[idx].unit = unit;
    state.notifications = notifications;
};

const handleConfirm = async () => {
    if (!state.isAllValid) return;
    await setBudgetAlert();
    state.proxyVisible = false;
    emit('confirm');
};
</script>

<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SET_BUDGET_NOTIFICATIONS')"
        centered
        size="md"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        class="budget-detail-notifications-condition-setting-modal"
        :disabled="!state.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="flex flex-col gap-4">
                <div class="conditions-wrapper">
                    <p class="desc text-paragraph-lg">
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NOTI_HELP_TEXT') }}
                    </p>
                    <section class="condition-wrapper flex flex-col gap-2 mt-7">
                        <p class="condition-header gap-2 pr-10 text-label-md font-bold">
                            <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.UNIT') }}</span>
                            <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.THRESHOLD') }}</span>
                            <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.TYPE') }}</span>
                        </p>
                        <template v-for="(condition, idx) of state.notifications">
                            <div :key="`condition-${idx}`"
                                 class="condition-input-wrapper inline-flex flex-wrap items-center w-full gap-2"
                            >
                                <p-select-dropdown :selected="condition.unit"
                                                   class="condition"
                                                   :menu="state.units"
                                                   use-fixed-menu-style
                                                   @update:selected="handleUpdateUnit(idx, $event)"
                                />
                                <span class="align-middle">&gt;</span>
                                <p-text-input :value="condition.threshold"
                                              class="condition"
                                              type="number"
                                              :max="condition.unit === 'PERCENT' ? 100 : undefined"
                                              :min="0"
                                              :placeholder="condition.unit === 'ACTUAL_COST'
                                                  ? '$1000' : '50'"
                                              :invalid="state.thresholdValidations[idx] === false"
                                              @update:value="handleThresholdInput(idx, $event)"
                                >
                                    <template #right-extra>
                                        <span v-if="condition.unit === 'PERCENT'"
                                              class="text-gray-400"
                                        >%</span>
                                    </template>
                                </p-text-input>
                                <p-select-dropdown :selected="condition.notification_type"
                                                   class="condition"
                                                   :menu="state.types"
                                                   use-fixed-menu-style
                                                   @update:selected="handleUpdateNotificationType(idx, $event)"
                                >
                                    <template #dropdown-button>
                                        <span :class="{'text-alert': condition.notification_type === 'CRITICAL'}">
                                            {{ state.types.find(d => d.name === condition.notification_type).label }}
                                        </span>
                                    </template>
                                </p-select-dropdown>
                                <p-icon-button name="ic_delete"
                                               class="delete-button"
                                               @click="handleDeleteCondition(idx)"
                                />
                            </div>
                        </template>
                    </section>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                              @click="handleAddCondition"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ADD_CONDITION') }}
                    </p-button>
                </div>
                <div class="user-wrapper">
                    <p class="condition-header gap-2 mb-1 pr-10 text-label-md font-bold">
                        <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.USER') }}</span>
                    </p>
                    <p-radio-group>
                        <p-radio v-for="(item, idx) in state.radioMenuList"
                                 :key="`policy-scope-${idx}`"
                                 v-model="state.proxySelectedRadioIdx"
                                 :value="idx"
                        >
                            <span class="radio-item">
                                {{ item.label }}
                            </span>
                        </p-radio>
                    </p-radio-group>
                </div>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.budget-detail-notifications-condition-setting-modal {
    /* custom design-system component - p-button-modal */
    :deep(.modal-content),
    :deep(.header),
    :deep(.modal-header) {
        height: auto;
        min-height: 3.5rem;
    }

    .condition-header {
        display: flex;
        span {
            width: 12.25rem;
            &:first-of-type {
                width: 13.25rem;
            }
        }
    }
    .condition-wrapper {
        margin-bottom: 1rem;
        .condition-input-wrapper {
            padding-right: 1.875rem;
            .condition {
                min-width: 7rem;
                width: 12.125rem;
                max-width: 12.25rem;

                @screen mobile {
                    width: 7rem;
                }
            }
        }
    }
}

@screen tablet {
    .condition-header {
        @apply hidden;
    }
    .condition-wrapper {
        margin-bottom: 1rem;
        .condition-input-wrapper {
            @apply bg-gray-100 rounded-xs;
            padding: 0.5rem;
        }
    }
}

@screen mobile {
    .desc {
        margin-top: 2rem;
    }
}
</style>
