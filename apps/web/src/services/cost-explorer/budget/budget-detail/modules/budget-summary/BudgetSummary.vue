<script lang="ts" setup>
import { PCard } from '@spaceone/design-system';
import { useI18n } from 'vue-i18n';

import BudgetSummaryChart
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryChart.vue';
import BudgetSummaryTable
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummaryTable.vue';

interface Props {
    budgetLoading: boolean;
}

withDefaults(defineProps<Props>(), {
    budgetLoading: true,
});
const { t } = useI18n();

</script>

<template>
    <p-card class="budget-summary-wrapper"
            style-type="gray100"
            size="lg"
    >
        <template #header>
            <div class="header">
                {{ t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_SUMMARY') }}
            </div>
        </template>
        <budget-summary-chart v-if="!budgetLoading" />
        <budget-summary-table v-if="!budgetLoading" />
    </p-card>
</template>
