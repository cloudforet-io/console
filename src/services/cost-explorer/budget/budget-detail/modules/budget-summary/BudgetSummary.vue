<template>
    <p-card class="budget-summary-wrapper"
            style-type="gray100"
            size="lg"
    >
        <template #header>
            <div class="header">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_SUMMARY') }}
            </div>
        </template>
        <budget-summary-chart v-if="!budgetLoading" />
        <budget-summary-table v-if="!budgetLoading" />
    </p-card>
</template>

<script lang="ts">
import { PCard } from '@spaceone/design-system';

import BudgetSummaryChart
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';

export default {
    name: 'BudgetSummary',
    components: {
        PCard,
        BudgetSummaryChart,
        BudgetSummaryTable,
    },
    props: {
        budgetLoading: {
            type: Boolean,
            default: true,
        },
    },
    setup() {
        return {
        };
    },
};
</script>
