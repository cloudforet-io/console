<template>
    <p-card class="budget-summary-wrapper"
            style-type="gray100"
            size="lg"
    >
        <template #header>
            <div class="header">
                Budget Summary
            </div>
        </template>
        <budget-summary-chart />
        <budget-summary-table />
    </p-card>
</template>

<script lang="ts">
import { PCard } from '@spaceone/design-system';
import BudgetSummaryChart
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';

export default {
    name: 'BudgetSummary',
    components: {
        PCard,
        BudgetSummaryChart,
        BudgetSummaryTable,
    },
    setup() {
        return {

        };
    },
};
</script>
