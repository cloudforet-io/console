<script setup lang="ts">
import { PCard } from '@spaceone/design-system';

import BudgetDetailSummaryChart
    from '@/services/cost-explorer/components/BudgetDetailSummaryChart.vue';
import BudgetDetailSummaryTable
    from '@/services/cost-explorer/components/BudgetDetailSummaryTable.vue';


interface Props {
    budgetLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    budgetLoading: true,
});
</script>

<template>
    <p-card class="budget-detail-summary"
            style-type="gray100"
            size="lg"
    >
        <template #header>
            <div class="header">
                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_SUMMARY') }}
            </div>
        </template>
        <budget-detail-summary-chart :loading="props.budgetLoading" />
        <budget-detail-summary-table v-if="!props.budgetLoading" />
    </p-card>
</template>
