<template>
    <div class="budget-form-amount-plan-last-months-cost">
        <label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_LAST_MONTH') }}</label>
        <span v-for="({month, cost}, index) in data" :key="index" class="data">
            {{ month }}: ${{ cost }}
        </span>
    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from '@vue/composition-api';

export default {
    name: 'BudgetFormAmountPlanLastMonthsCost',
    setup() {
        const state = reactive({
            data: [
                { month: 'January 2021', cost: 408.88 },
                { month: 'February 2021', cost: 408.88 },
                { month: 'March 2021', cost: 408.88 },
            ],
        });

        return toRefs(state);
    },

};
</script>

<style lang="postcss" scoped>
.budget-form-amount-plan-last-months-cost {
    @apply text-gray-400 text-xs;
    label {
        @apply font-bold;
    }
    .data {
        @apply border-r border-gray-200;
        display: inline-flex;
        padding: 0 0.5rem;
        align-items: center;
        &:last-of-type {
            @apply border-0;
        }
    }

    @screen mobile {
        padding-right: 8.75rem;
        label {
            @apply block;
        }
        .data {
            @apply border-none block;
            padding: 0;
        }
    }
}
</style>
