<template>
    <div class="budget-form-amount-plan-total">
        <p-field-group required label="Total Budgeted Amount">
            <template #right-extra>
                ($USD)
            </template>
            <p-text-input v-model="amount" :placeholder="defaultAmount">
                <template #right-extra>
                    ($)
                </template>
            </p-text-input>
        </p-field-group>
        <budget-form-amount-plan-last-months-cost :data="lastMonthsCost" />
    </div>
</template>

<script lang="ts">
import {
    computed,
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
            lastMonthsCost: computed(() => [
                { month: 'January 2021', cost: 408.88 },
                { month: 'February 2021', cost: 408.88 },
                { month: 'March 2021', cost: 408.88 },
            ]),
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>
