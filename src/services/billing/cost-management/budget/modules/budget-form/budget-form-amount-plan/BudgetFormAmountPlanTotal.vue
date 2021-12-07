<template>
    <div class="budget-form-amount-plan-total">
        <p-field-group required :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_BUDGET_TOTAL')">
            <template #right-extra>
                ($USD)
            </template>
            <p-text-input v-model="amount" :placeholder="defaultAmount">
                <template #right-extra>
                    ($)
                </template>
            </p-text-input>
        </p-field-group>
        <budget-form-amount-plan-last-months-cost />
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs,
} from '@vue/composition-api';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import BudgetFormAmountPlanLastMonthsCost
    from '@/services/billing/cost-management/budget/modules/budget-form/budget-form-amount-plan/BudgetFormAmountPlanLastMonthsCost.vue';

export default {
    name: 'BudgetFormAmountPlanTotal',
    components: {
        BudgetFormAmountPlanLastMonthsCost,
        PFieldGroup,
        PTextInput,
    },
    setup() {
        const state = reactive({
            defaultAmount: 1000,
            amount: undefined,
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
<style>
.p-text-input {
    width: 28.5rem;
}

@screen mobile {
    .p-text-input {
        width: 100%;
    }
}
</style>
