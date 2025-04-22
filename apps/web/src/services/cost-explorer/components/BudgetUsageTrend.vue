<script setup lang="ts">
import { computed } from 'vue';

import { PCard } from '@cloudforet/mirinae';

import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

import BudgetUsageTrendMonthly from './BudgetUsageTrendMonthly.vue';
import BudgetUsageTrendTotal from './BudgetUsageTrendTotal.vue';

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const budgetData = computed(() => budgetPageState.budgetData);
</script>

<template>
    <p-card size="lg"
            style-type="white"
            :header="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_USAGE_TREND.TITLE')"
    >
        <div v-if="budgetData?.time_unit === 'MONTHLY'">
            <budget-usage-trend-monthly />
        </div>
        <div v-else-if="budgetData?.time_unit === 'TOTAL'">
            <budget-usage-trend-total />
        </div>
    </p-card>
</template>
