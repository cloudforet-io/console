<script lang="ts" setup>

import {
    PButtonModal, PTextInput, PAnchor, PButton, PSelectDropdown, PIconButton,
} from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useBudgetPageStore } from '@/services/cost-explorer/store/budget-page-store';
import { PROJECT_ROUTE } from '@/services/project/route-config';

const NOTIFICATION_UNIT = Object.freeze({
    PERCENT: 'PERCENT',
    ACTUAL_COST: 'ACTUAL_COST',
});
type NotificationUnit = keyof typeof NOTIFICATION_UNIT;

const NOTIFICATION_TYPE = {
    CRITICAL: 'CRITICAL',
    WARNING: 'WARNING',
};
type NotificationType = keyof typeof NOTIFICATION_TYPE;

interface Condition {
    unit?: NotificationUnit;
    threshold?: number | null;
    notification_type?: NotificationType;
}

interface Props {
    visible: boolean;
    budgetTargetId?: string;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    budgetTargetId: '',
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
    (e: 'confirm'): void;
}>();
const { t } = useI18n();

const budgetPageStore = useBudgetPageStore();
const budgetPageState = budgetPageStore.$state;

const state = reactive({
    loading: true,
    proxyVisible: useProxyValue('visible', props, emit),
    conditions: budgetPageState.budgetData?.notifications as Condition[],
    units: computed(() => ([
        {
            name: NOTIFICATION_UNIT.ACTUAL_COST,
            label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ACTUAL_COST'),
        },
        {
            name: NOTIFICATION_UNIT.PERCENT,
            label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_USAGE', { symbol: '%' }),
        },
    ])),
    types: computed(() => ([
        {
            name: NOTIFICATION_TYPE.WARNING,
            label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.WARNING'),
        },
        {
            name: NOTIFICATION_TYPE.CRITICAL,
            label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.CRITICAL'),
        },
    ])),
    budgetId: computed(() => budgetPageState.budgetData?.budget_id),
    thresholdValidations: budgetPageState.budgetData?.notifications?.map((d) => !!d) ?? [] as Array<boolean|undefined>,
    isAllValid: computed(() => state.thresholdValidations.every((d) => !!d)),
});

const handleAddCondition = () => {
    state.conditions.push({
        unit: NOTIFICATION_UNIT.ACTUAL_COST,
        threshold: null,
        notification_type: NOTIFICATION_TYPE.WARNING,
    });
    state.thresholdValidations.push(undefined);
};

const handleDeleteCondition = (idx) => {
    const conditions = [...state.conditions];
    conditions.splice(idx, 1);
    state.thresholdValidations.splice(idx, 1);
    state.conditions = conditions;
};

const handleThresholdInput = (idx, threshold?: string) => {
    let isValid;
    const numberThreshold = Number(threshold);
    if (!threshold || Number.isNaN(numberThreshold)) isValid = false;
    else if (numberThreshold < 0) isValid = false;
    else if (state.conditions[idx]?.unit === NOTIFICATION_UNIT.PERCENT && numberThreshold > 100) isValid = false;
    else isValid = true;
    state.thresholdValidations.splice(idx, 1, isValid);
};

const setBudgetAlert = async () => {
    try {
        budgetPageStore.updateBudgetNotifications({
            budgetId: state.budgetId,
            notifications: state.conditions,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
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
        v-model:visible="state.proxyVisible"
        :header-title="t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.SET_BUDGET_NOTIFICATIONS_CONDITION')"
        centered
        size="md"
        fade
        backdrop
        class="budget-notifications-modal"
        :disabled="!state.isAllValid"
        @confirm="handleConfirm"
    >
        <template #body>
            <div class="desc">
                <p>{{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.BUDGET_NOTI_HELP_TEXT') }}</p>
                <p-anchor :text="t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET_NOTIFICATION_CHANNEL')"
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
                {{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ADD_CONDITION') }}
            </p-button>
            <section class="condition-wrapper">
                <p v-if="state.conditions.length > 0"
                   class="condition-header"
                >
                    <span>{{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.UNIT') }}</span>
                    <span>{{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.THRESHOLD') }}</span>
                    <span>{{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.TYPE') }}</span>
                </p>
                <template v-for="(condition, idx) of state.conditions"
                          :key="`condition-${idx}`"
                >
                    <div class="condition-input-wrapper">
                        <p-select-dropdown v-model:selected="condition.unit"
                                           class="condition"
                                           :items="state.units"
                                           use-fixed-menu-style
                        />
                        <span class="align-middle">&gt;</span>
                        <p-text-input v-model:value="condition.threshold"
                                      class="condition"
                                      type="number"
                                      :max="condition.unit === NOTIFICATION_UNIT.PERCENT ? 100 : undefined"
                                      :min="0"
                                      :placeholder="condition.unit === NOTIFICATION_UNIT.ACTUAL_COST
                                          ? '$1000' : '50'"
                                      :invalid="state.thresholdValidations[idx] === false"
                                      @update:value="handleThresholdInput(idx, $event)"
                        >
                            <template #right-extra>
                                <span v-if="condition.unit === NOTIFICATION_UNIT.PERCENT"
                                      class="text-gray-400"
                                >%</span>
                            </template>
                        </p-text-input>
                        <p-select-dropdown v-model:selected="condition.notification_type"
                                           class="condition"
                                           :items="state.types"
                                           use-fixed-menu-style
                        >
                            <span :class="{'text-alert': condition.notification_type === NOTIFICATION_TYPE.CRITICAL}">
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
