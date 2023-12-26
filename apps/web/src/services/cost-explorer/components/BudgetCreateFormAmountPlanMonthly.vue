<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PButton, PDivider, PFieldTitle } from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { CURRENCY, CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap, CostDataSourceItems } from '@/store/reference/cost-data-source-reference-store';

import BudgetCreateFormAmountPlanAutofillModal
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanAutofillModal.vue';
import BudgetCreateFormAmountPlanMonthInput
    from '@/services/cost-explorer/components/BudgetCreateFormAmountPlanMonthInput.vue';
import type {
    AutofillOptions, MonthAmountInput, MonthAmountInputMap,
} from '@/services/cost-explorer/types/budget-form-type';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';


interface Props {
    dataSourceId?: string;
    period: Period;
}

const props = withDefaults(defineProps<Props>(), {
    dataSourceId: undefined,
    period: () => ({}),
});
const emit = defineEmits<{(e: 'update', monthAmountInputMap: MonthAmountInputMap, isAllValid: boolean): void; }>();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});

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
    currencyText: computed<string>(() => {
        if (!props.dataSourceId) return '';
        const dataSourceItem:CostDataSourceItems = storeState.costDataSource[props.dataSourceId];
        const currency = dataSourceItem?.data.plugin_info.metadata?.currency ?? CURRENCY.USD;
        return CURRENCY_SYMBOL[currency] + CURRENCY[currency];
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

const getAutofillAmount = (baseValue: number, growth: AutofillOptions['growth']): number => {
    if (!growth) return baseValue;
    return Number((baseValue + (baseValue / 100 * growth)).toFixed(2));
};

const fillAmountMapWithOptions = (options: AutofillOptions) => {
    let beforeMonthAmount = 0;
    Object.keys(state.monthAmountInputMap).forEach((month, index) => {
        let amount;
        if (index === 0) amount = options.start || 0;
        else amount = getAutofillAmount(beforeMonthAmount, options.growth);
        state.monthAmountInputMap[month].amount = amount;
        beforeMonthAmount = amount;
        state.monthAmountInputMap[month].isValid = true;
    });
};

const initAmountInputMapWithMonths = (months: string[]) => {
    const amountMap: MonthAmountInputMap = {};
    let beforeMonthAmount = 0;
    months.forEach((month, index) => {
        if (state.autofillOptions) {
            let amount;
            if (index === 0) amount = state.autofillOptions.start || 0;
            else amount = getAutofillAmount(beforeMonthAmount, state.autofillOptions.growth);
            beforeMonthAmount = amount;
            amountMap[month] = {
                amount,
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
    <div class="budget-create-form-amount-plan-monthly">
        <div class="header">
            <div class="header-text-wrapper">
                <p class="title">
                    <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN') }}</p-field-title> ({{ state.currencyText }})
                </p>
                <slot name="last-3-months" />
            </div>
            <p-button style-type="tertiary"
                      @click="handleAutofillButtonClick"
            >
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL') }}
            </p-button>
        </div>
        <p-divider class="mt-2" />
        <div class="input-wrapper">
            <budget-create-form-amount-plan-month-input
                v-for="(_, month, index) in state.monthAmountInputMap"
                :key="month"
                class="input"
                :amount="state.monthAmountInputMap[month].amount"
                :month="month"
                :is-month-to-date="index === 0"
                @update="handleUpdateMonthInput(month, $event)"
            />
        </div>
        <budget-create-form-amount-plan-autofill-modal
            :visible="state.visibleAutofillModal"
            :currency-text="state.currencyText"
            @update:visible="handleUpdateVisible"
            @confirm="handleAutofillConfirm"
        />
    </div>
</template>

<style lang="postcss" scoped>
.budget-create-form-amount-plan-monthly {
    .header {
        @apply flex justify-between;
        margin-bottom: 1.5rem;
        .header-text-wrapper {
            @apply flex flex-col text-label-md;
            gap: 0.5rem;
            .title {
                @apply flex;
                gap: 0.25rem;
                flex-grow: 1;
                flex-shrink: 0;
            }
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
