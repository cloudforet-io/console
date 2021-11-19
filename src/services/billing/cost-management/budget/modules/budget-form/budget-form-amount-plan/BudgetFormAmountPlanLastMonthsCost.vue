<template>
    <div class="budget-form-amount-plan-last-months-cost">
        <label>{{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_LAST_MONTH') }}</label>
        <span v-for="({month, cost}, index) in data" :key="index" class="data">
            {{ month }}: ${{ cost }}
        </span>
    </div>
</template>

<script lang="ts">
export default {
    name: 'BudgetFormAmountPlanLastMonthsCost',
    props: {
        data: {
            type: Array,
            default: () => [],
        },
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
}
</style>
