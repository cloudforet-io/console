<script setup lang="ts">
import { computed } from 'vue';

import { PCard } from '@cloudforet/mirinae';

import BudgetUsageTrendMonthly from '@/services/cost-explorer/components/BudgetUsageTrendMonthly.vue';
import BudgetUsageTrendTotal from '@/services/cost-explorer/components/BudgetUsageTrendTotal.vue';
import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';


interface Props {
    budgetId: string;
}

const props = defineProps<Props>();

const { budgetData } = useBudgetGetQuery(computed(() => props.budgetId));
</script>

<template>
    <p-card size="lg"
            style-type="white"
            :header="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.TITLE')"
    >
        <div v-if="budgetData?.time_unit === 'MONTHLY'">
            <budget-usage-trend-monthly :budget-id="props.budgetId" />
        </div>
        <div v-else-if="budgetData?.time_unit === 'TOTAL'">
            <budget-usage-trend-total :budget-id="props.budgetId" />
        </div>
    </p-card>
</template>
