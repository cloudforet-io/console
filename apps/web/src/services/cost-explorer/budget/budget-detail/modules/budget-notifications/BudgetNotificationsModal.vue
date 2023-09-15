<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PTextInput, PLink, PButton, PSelectDropdown, PIconButton,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import type { BudgetNotification } from '@/services/cost-explorer/budget/model';
import { BUDGET_NOTIFICATIONS_TYPE, BUDGET_NOTIFICATIONS_UNIT } from '@/services/cost-explorer/budget/model';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/store/budget-detail-page-store';
import { PROJECT_ROUTE } from '@/services/project/route-config';

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

const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    notifications: (budgetPageState.budgetData?.notifications ?? []) as BudgetNotification[],
    units: computed(() => ([
        {
            name: BUDGET_NOTIFICATIONS_UNIT.ACTUAL_COST,
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ACTUAL_COST'),
        },
        {
            name: BUDGET_NOTIFICATIONS_UNIT.PERCENT,
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_USAGE', { symbol: '%' }),
        },
    ])),
    types: computed(() => ([
        {
            name: BUDGET_NOTIFICATIONS_TYPE.WARNING,
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.WARNING'),
        },
        {
            name: BUDGET_NOTIFICATIONS_TYPE.CRITICAL,
            label: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CRITICAL'),
        },
    ])),
    budgetId: computed(() => budgetPageState.budgetData?.budget_id),
    thresholdValidations: budgetPageState.budgetData?.notifications?.map((d) => !!d) ?? [] as Array<boolean|undefined>,
    isAllValid: computed(() => state.thresholdValidations.every((d) => !!d)),
});

const handleAddCondition = () => {
    state.notifications.push({
        unit: BUDGET_NOTIFICATIONS_UNIT.ACTUAL_COST,
        threshold: null,
        notification_type: BUDGET_NOTIFICATIONS_TYPE.WARNING,
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
    else isValid = !(state.notifications[idx]?.unit === BUDGET_NOTIFICATIONS_UNIT.PERCENT && numberThreshold > 100);
    state.thresholdValidations.splice(idx, 1, isValid);
    const notifications = [...state.notifications];
    notifications[idx].threshold = threshold;
    state.notifications = notifications;
};

const setBudgetAlert = async () => {
    try {
        state.notifications = state.notifications.map((notification:BudgetNotification) => ({
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
        :header-title="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SET_BUDGET_NOTIFICATIONS_CONDITION')"
        centered
        size="md"
        fade
        backdrop
        :visible.sync="state.proxyVisible"
        class="budget-notifications-modal"
        :disabled="!state.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="desc">
                <p>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NOTI_HELP_TEXT') }}</p>
                <p-link :text="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET_NOTIFICATION_CHANNEL')"
                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="{
                            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                            params: {
                                id: budgetTargetId
                            }
                        }"
                        highlight
                />
            </div>
            <p-button style-type="tertiary"
                      icon-left="ic_plus_bold"
                      @click="handleAddCondition"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ADD_CONDITION') }}
            </p-button>
            <section class="condition-wrapper">
                <p v-if="state.notifications.length > 0"
                   class="condition-header"
                >
                    <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.UNIT') }}</span>
                    <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.THRESHOLD') }}</span>
                    <span>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.TYPE') }}</span>
                </p>
                <template v-for="(condition, idx) of state.notifications">
                    <div :key="`condition-${idx}`"
                         class="condition-input-wrapper"
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
                                      :max="condition.unit === BUDGET_NOTIFICATIONS_UNIT.PERCENT ? 100 : undefined"
                                      :min="0"
                                      :placeholder="condition.unit === BUDGET_NOTIFICATIONS_UNIT.ACTUAL_COST
                                          ? '$1000' : '50'"
                                      :invalid="state.thresholdValidations[idx] === false"
                                      @update:value="handleThresholdInput(idx, $event)"
                        >
                            <template #right-extra>
                                <span v-if="condition.unit === BUDGET_NOTIFICATIONS_UNIT.PERCENT"
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
                            <span :class="{'text-alert': condition.notification_type === BUDGET_NOTIFICATIONS_TYPE.CRITICAL}">
                                {{ state.types.find(d => d.name === condition.notification_type).label }}
                            </span>
                        </p-select-dropdown>
                        <p-icon-button name="ic_delete"
                                       class="delete-button"
                                       @click="handleDeleteCondition(idx)"
                        />
                    </div>
                </template>
            </section>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.budget-notifications-modal {
    /* custom design-system component - p-button-modal */
    :deep(.modal-content),
    :deep(.header),
    :deep(.modal-header) {
        height: auto;
        min-height: 3.5rem;
    }
}
.desc {
    margin-bottom: 1rem;
    line-height: 1.6;
}
.condition-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    margin-top: 1rem;
    margin-bottom: 4rem;
    .condition-header {
        @apply font-bold;
        display: flex;
        gap: 0.5rem;
        padding-right: 2.5rem;
        font-size: 0.875rem;
        line-height: 140%;
        span {
            width: 12.25rem;
            &:first-of-type {
                width: 13.25rem;
            }
        }
    }
    .condition-input-wrapper {
        @apply inline-flex flex-wrap items-center;
        gap: 0.5rem;
        width: 100%;
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

@screen tablet {
    .condition-wrapper {
        margin-bottom: 1rem;
        .condition-header {
            @apply hidden;
        }
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
