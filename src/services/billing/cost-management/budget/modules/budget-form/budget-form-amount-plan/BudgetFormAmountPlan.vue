<template>
    <p-pane-layout class="budget-form-amount-plan">
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AMOUNT_PLANNING') }}
        </p-panel-top>
        <div class="p-4">
            <budget-form-amount-plan-period-select class="mb-2" @update="handleUpdatePeriod" />
            <budget-form-amount-plan-unit-select class="mb-6" :selected-unit.sync="timeUnit" />
            <budget-form-amount-plan-monthly v-if="timeUnit === 'MONTHLY'" class="mb-6" :period="period"
                                             @update="handleMonthlyInputUpdate"
            />
            <budget-form-amount-plan-total v-else class="mb-6" @update="handleTotalAmountUpdate" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs, watch,
} from '@vue/composition-api';

import { PPaneLayout, PPanelTop } from '@spaceone/design-system';

import BudgetFormAmountPlanPeriodSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanPeriodSelect.vue';
import BudgetFormAmountPlanUnitSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanUnitSelect.vue';
import BudgetFormAmountPlanMonthly
, { MonthAmountInputMap } from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthly.vue';

import { BudgetData, BudgetTimeUnit } from '@/services/billing/cost-management/budget/type';
import BudgetFormAmountPlanTotal
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanTotal.vue';
import { Period } from '@/services/billing/cost-management/type';

export interface BudgetAmountPlanInfo {
    limit?: BudgetData['limit'];
    planned_limits?: BudgetData['planned_limits'];
    time_unit: BudgetTimeUnit;
}

export default {
    name: 'BudgetFormAmountPlan',
    components: {
        BudgetFormAmountPlanTotal,
        BudgetFormAmountPlanMonthly,
        BudgetFormAmountPlanUnitSelect,
        BudgetFormAmountPlanPeriodSelect,
        PPaneLayout,
        PPanelTop,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            period: {} as Period,
            isPeriodValid: false,
            //
            timeUnit: 'TOTAL' as BudgetTimeUnit,
            //
            monthlyInputs: undefined as MonthAmountInputMap|undefined,
            isMonthlyInputsValid: false,
            //
            totalAmount: undefined as number|undefined,
            isTotalAmountValid: false,
            //
            isAllValid: computed<boolean>(() => {
                if (state.timeUnit === 'TOTAL') { return state.isTotalAmountValid && state.isPeriodValid; }

                return state.isMonthlyInputsValid && state.isPeriodValid;
            }),
            amountPlanInfo: computed<BudgetAmountPlanInfo>(() => {
                if (state.timeUnit === 'TOTAL') {
                    return {
                        limit: state.totalAmount,
                        time_unit: state.timeUnit,
                    };
                }
                return {
                    planned_limits: state.monthlyInputs ? Object.keys(state.monthlyInputs)
                        .map(key => ({
                            date: key,
                            limit: state.monthlyInputs[key].amount,
                        })) : [],
                    time_unit: state.timeUnit,
                };
            }),
        });

        const handleUpdatePeriod = (period: Period, isValid: boolean) => {
            state.period = period;
            state.isPeriodValid = isValid;
        };

        const handleMonthlyInputUpdate = (monthAmountInputMap: MonthAmountInputMap, isValid: boolean) => {
            state.monthlyInputs = monthAmountInputMap;
            state.isMonthlyInputsValid = isValid;
        };

        const handleTotalAmountUpdate = (amount: number, isValid: boolean) => {
            state.totalAmount = amount;
            state.isTotalAmountValid = isValid;
        };

        watch(() => state.amountPlanInfo, () => {
            emit('update', state.amountPlanInfo, state.isAllValid);
        });

        return {
            ...toRefs(state),
            handleUpdatePeriod,
            handleMonthlyInputUpdate,
            handleTotalAmountUpdate,
        };
    },
};
</script>
