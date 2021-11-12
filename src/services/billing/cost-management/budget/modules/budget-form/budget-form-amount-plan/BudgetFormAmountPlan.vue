<template>
    <p-pane-layout class="budget-form-amount-plan">
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.AMOUNT_PLANNING') }}
        </p-panel-top>
        <div class="p-4">
            <amount-plan-period-select class="mb-2" />
            <amount-plan-unit-select class="mb-6" :selected-unit.sync="timeUnit" />
            <amount-plan-monthly v-if="timeUnit === 'MONTHLY'" />
            <amount-plan-total v-else />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PPaneLayout, PPanelTop } from '@spaceone/design-system';

import AmountPlanPeriodSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/AmountPlanPeriodSelect.vue';
import AmountPlanUnitSelect
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/AmountPlanUnitSelect.vue';
import AmountPlanMonthly
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/amount-plan-monthly/AmountPlanMonthly.vue';

import { BudgetTimeUnit } from '@/services/billing/cost-management/budget/type';
import AmountPlanTotal
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/AmountPlanTotal.vue';

export default {
    name: 'BudgetFormAmountPlan',
    components: {
        AmountPlanTotal,
        AmountPlanMonthly,
        AmountPlanUnitSelect,
        AmountPlanPeriodSelect,
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
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
