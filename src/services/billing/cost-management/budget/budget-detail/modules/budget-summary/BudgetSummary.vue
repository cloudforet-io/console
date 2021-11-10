<template>
    <p-pane-layout class="budget-summary-wrapper">
        <div class="card-header">
            Budget Summary
        </div>
        <budget-summary-chart :chart-data="tempData" :legends="legends" />
        <budget-summary-table :chart-data="tempData" :legends="legends" />
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';
import BudgetSummaryChart
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';
import dayjs from 'dayjs';

export default {
    name: 'BudgetSummary',
    components: {
        PPaneLayout,
        BudgetSummaryChart,
        BudgetSummaryTable,
    },
    setup() {
        const now = dayjs.utc().startOf('month');
        const tempData = [
            {
                date: now.format('YYYY-MM'), limit: 100, usd_cost: 120,
            },
            {
                date: now.add(-1, 'month').format('YYYY-MM'), limit: 100, usd_cost: 88,
            },
            {
                date: now.add(-2, 'month').format('YYYY-MM'), limit: 120, usd_cost: 50,
            },
            {
                date: now.add(-3, 'month').format('YYYY-MM'), limit: 100, usd_cost: 70,
            },
            {
                date: now.add(-4, 'month').format('YYYY-MM'), limit: 100, usd_cost: 90,
            },
        ];

        const legends = [
            {
                name: 'usd_cost', label: 'Actual Cost',
            },
        ];

        return {
            tempData,
            legends,
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
