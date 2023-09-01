<script setup lang="ts">

import {
    computed, reactive, watch,
} from 'vue';

import { PButton, PDivider, PFieldTitle } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import type { AutofillOptions } from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanAutofillModal.vue';
import BudgetFormAmountPlanAutofillModal
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanAutofillModal.vue';
import type { MonthAmountInput } from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthInput.vue';
import BudgetFormAmountPlanMonthInput
    from '@/services/cost-explorer/budget/shared/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthInput.vue';
import type { Period } from '@/services/cost-explorer/type';

interface Props {
    period: Period;
}

export type MonthAmountInputMap = Record<string, MonthAmountInput>;

const props = withDefaults(defineProps<Props>(), {
    period: () => ({}),
});

const emit = defineEmits<{(e: 'update', monthAmountInputMap: MonthAmountInputMap, isAllValid: boolean): void; }>();


const getAllMonths = (month: Dayjs, monthEnd: Dayjs) => {
    const months: string[] = [];
    let _month = month;
    while (_month.isSameOrBefore(monthEnd, 'month')) {
        months.push(dayjs.utc(_month).locale('en').format('YYYY-MM'));
        _month = _month.add(1, 'month');
    }
    return months;
};

const state = reactive({
    months: computed<string[]>(() => {
        const { start, end } = props.period;
        if (!start || !end) return [];

        const month = dayjs.utc(start as string);
        const monthEnd = dayjs.utc(end as string);

        return getAllMonths(month, monthEnd);
    }),
    monthAmountInputMap: {} as MonthAmountInputMap,
    // autofill
    visibleAutofillModal: false,
    autofillOptions: null as AutofillOptions|null,
    // validation
    isAllValid: computed<boolean>(() => {
        const items = Object.values(state.monthAmountInputMap) as MonthAmountInput[];
        return items.every(({ isValid }) => !!isValid);
    }),
});

const getAutofillAmount = (index: number, { start, growth }: AutofillOptions) => {
    const amount = start ?? 0;
    const growthAmount = growth ? amount / 100 * growth : 0;
    return amount + (growthAmount * index);
};

const fillAmountMapWithOptions = (options: AutofillOptions) => {
    Object.keys(state.monthAmountInputMap).forEach((month, index) => {
        state.monthAmountInputMap[month].amount = getAutofillAmount(index, options);
        state.monthAmountInputMap[month].isValid = true;
    });
};

const initAmountInputMapWithMonths = (months: string[]) => {
    const amountMap: MonthAmountInputMap = {};
    months.forEach((month, index) => {
        if (state.autofillOptions) {
            amountMap[month] = {
                amount: getAutofillAmount(index, state.autofillOptions),
                isValid: true,
            };
        } else {
            amountMap[month] = {
                amount: index === 0 ? 1000 : undefined,
                isValid: index === 0,
            };
        }
    });
    state.monthAmountInputMap = amountMap;
};

/* Handlers */
const handleAutofillButtonClick = () => {
    state.visibleAutofillModal = true;
};

const handleAutofillConfirm = (options: AutofillOptions) => {
    state.autofillOptions = options;

    fillAmountMapWithOptions(options);
};

const handleUpdateMonthInput = (month: string, { amount, isValid }: MonthAmountInput) => {
    state.monthAmountInputMap[month].amount = amount;
    state.monthAmountInputMap[month].isValid = isValid;
};

const handleUpdateVisible = (visible: boolean) => {
    state.visibleAutofillModal = visible;
};

/* Watchers */
watch(() => state.months, (months) => {
    initAmountInputMapWithMonths(months);
}, { immediate: true });

watch(() => state.monthAmountInputMap, (monthAmountInputMap) => {
    emit('update', monthAmountInputMap, state.isAllValid);
}, { deep: true });

</script>

<template>
    <div class="budget-form-amount-plan-monthly">
        <div class="header">
            <p class="title">
                <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN') }}</p-field-title> ($USD)
            </p>
            <p-button style-type="tertiary"
                      @click="handleAutofillButtonClick"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL') }}
            </p-button>
        </div>
        <slot name="last-3-months" />
        <p-divider class="mt-2" />
        <div class="input-wrapper">
            <budget-form-amount-plan-month-input v-for="(_, month, index) in state.monthAmountInputMap"
                                                 :key="month"
                                                 class="input"
                                                 :amount="state.monthAmountInputMap[month].amount"
                                                 :month="month"
                                                 :is-month-to-date="index === 0"
                                                 @update="handleUpdateMonthInput(month, $event)"
            />
        </div>
        <budget-form-amount-plan-autofill-modal :visible="state.visibleAutofillModal"
                                                @update:visible="handleUpdateVisible"
                                                @confirm="handleAutofillConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.budget-form-amount-plan-monthly {
    max-width: 87rem;
    .header {
        @apply flex;
        margin-bottom: 1.5rem;
        .title {
            @apply flex;
            gap: 0.25rem;
            flex-grow: 1;
            flex-shrink: 0;
        }
        .p-button {
            margin-top: auto;
        }
    }
    .input-wrapper {
        @apply grid grid-cols-6;
        column-gap: 1rem;
        overflow: hidden;
        margin-top: 1.5rem;
        margin-bottom: 1.5rem;
    }

    @screen tablet {
        .input-wrapper {
            @apply grid-cols-4;
        }
    }

    @screen mobile {
        .header {
            @apply relative;
            .title {
                @apply flex-shrink;
            }
            .p-button {
                @apply absolute;
                bottom: 0;
                right: 0;
            }
        }
        .input-wrapper {
            @apply grid-cols-2;
        }
    }
}

</style>
