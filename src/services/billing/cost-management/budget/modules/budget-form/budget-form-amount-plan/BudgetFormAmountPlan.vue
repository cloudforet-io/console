<template>
    <p-pane-layout class="budget-form-amount-plan">
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AMOUNT_PLANNING') }}
        </p-panel-top>
        <div class="p-4">
            <budget-form-amount-plan-period-select class="mb-2" @update="handleUpdatePeriod" />
            <budget-form-amount-plan-unit-select class="mb-6" :selected-unit.sync="timeUnit" />
            <budget-form-amount-plan-monthly v-if="timeUnit === 'MONTHLY'" class="mb-6" :period="period" />
            <budget-form-amount-plan-total v-else class="mb-6" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PPaneLayout, PPanelTop } from '@spaceone/design-system';

import BudgetFormAmountPlanPeriodSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanPeriodSelect.vue';
import BudgetFormAmountPlanUnitSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanUnitSelect.vue';
import BudgetFormAmountPlanMonthly
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanMonthly.vue';

import { BudgetTimeUnit } from '@/services/billing/cost-management/budget/type';
import BudgetFormAmountPlanTotal
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanTotal.vue';
import { Period } from '@/services/billing/cost-management/type';

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
    setup() {
        const state = reactive({
            timeUnit: 'TOTAL' as BudgetTimeUnit,
            period: {} as Period,
        });

        const handleUpdatePeriod = (period: Period) => {
            state.period = period;
        };

        return {
            ...toRefs(state),
            handleUpdatePeriod,
        };
    },
};
</script>
