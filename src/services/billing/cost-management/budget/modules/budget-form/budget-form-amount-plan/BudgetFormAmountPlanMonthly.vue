<template>
    <div class="budget-form-amount-plan-monthly">
        <div class="header">
            <div class="title">
                <p>
                    <p-label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.MONTHLY_PLAN') }}</p-label> ($USD)
                </p>
                <budget-form-amount-plan-last-months-cost />
            </div>
            <p-button style-type="gray-border" :outline="true" @click="handleAutofillButtonClick">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AUTO_FILL') }}
            </p-button>
        </div>
        <p-divider />
        <div class="input-wrapper">
            <budget-form-amount-plan-month-input v-for="(_, month, index) in monthAmountInputMap" :key="month"
                                                 class="input"
                                                 :amount="monthAmountInputMap[month].amount"
                                                 :month="month"
                                                 :is-month-to-date="index === 0"
                                                 @update="handleUpdateMonthInput(month, $event)"
            />
        </div>
        <budget-form-amount-plan-autofill-modal v-model="visibleAutofillModal"
                                                @confirm="handleAutofillConfirm"
        />
    </div>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PButton, PDivider, PLabel } from '@spaceone/design-system';

import { Period } from '@/services/billing/cost-management/type';

import BudgetFormAmountPlanMonthInput
, { MonthAmountInput } from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthInput.vue';
import BudgetFormAmountPlanLastMonthsCost
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanLastMonthsCost.vue';
import BudgetFormAmountPlanAutofillModal
, { AutofillOptions } from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanAutofillModal.vue';
import dayjs, { Dayjs } from 'dayjs';

interface Props {
    period: Period;
}

export type MonthAmountInputMap = Record<string, MonthAmountInput>

export default {
    name: 'BudgetFormAmountPlanMonthly',
    components: {
        BudgetFormAmountPlanAutofillModal,
        BudgetFormAmountPlanLastMonthsCost,
        BudgetFormAmountPlanMonthInput,
        PLabel,
        PButton,
        PDivider,
    },
    props: {
        period: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const getAllMonths = (month: Dayjs, monthEnd: Dayjs) => {
            const months: string[] = [];
            let _month = month;
            while (_month.isSameOrBefore(monthEnd, 'month')) {
                months.push(dayjs(_month).locale('en').format('YYYY-MM'));
                _month = _month.add(1, 'month');
            }
            return months;
        };

        const state = reactive({
            months: computed<string[]>(() => {
                const { start, end } = props.period;
                if (!start || !end) return [];

                const month = dayjs(start as string);
                const monthEnd = dayjs(end as string);

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

        /* Watchers */
        watch(() => state.months, (months) => {
            initAmountInputMapWithMonths(months);
        }, { immediate: true });

        watch(() => state.monthAmountInputMap, (monthAmountInputMap) => {
            emit('update', monthAmountInputMap, state.isAllValid);
        }, { deep: true });


        return {
            ...toRefs(state),
            handleAutofillButtonClick,
            handleAutofillConfirm,
            handleUpdateMonthInput,
        };
    },
};
</script>
<style lang="postcss" scoped>
.budget-form-amount-plan-monthly {
    max-width: 87rem;
    .header {
        display: flex;
        margin-bottom: 1.5rem;
        .title {
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
