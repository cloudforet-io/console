<template>
    <p-pane-layout class="budget-summary-wrapper">
        <div class="card-header">
            Budget Summary
        </div>
        <budget-summary-chart />
        <budget-summary-table />
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';
import BudgetSummaryChart
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';

export default {
    name: 'BudgetSummary',
    components: {
        PPaneLayout,
        BudgetSummaryChart,
        BudgetSummaryTable,
    },
    setup() {
        return {

        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-summary-wrapper {
    @apply flex flex-col;
    min-width: 100%;
    min-height: 100%;
}
.card-header {
    @apply bg-gray-100 items-center;
    display: inherit;
    padding: 1rem 1rem;
    min-height: 4rem;
    font-size: 1.5rem;
    line-height: 135%;
}
</style>
