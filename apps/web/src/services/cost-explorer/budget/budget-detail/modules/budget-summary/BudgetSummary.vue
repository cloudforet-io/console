<script setup lang="ts">
import { PCard } from '@spaceone/design-system';

import BudgetSummaryChart
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';


interface Props {
    budgetLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    budgetLoading: true,
});
</script>

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
        <budget-summary-chart :loading="props.budgetLoading" />
        <budget-summary-table v-if="!props.budgetLoading" />
    </p-card>
</template>
