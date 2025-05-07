<script setup lang="ts">

import { computed, reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';


import BudgetUsageTrendMonthlyChart from '@/services/cost-explorer/components/BudgetUsageTrendMonthlyChart.vue';
import BudgetUsageTrendMonthlyTable from '@/services/cost-explorer/components/BudgetUsageTrendMonthlyTable.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;

const state = reactive({
    budgetData: computed(() => budgetPageState.budgetData),
    data: [],
});

const fetchBudgetUsageAnalyze = async () => {
    try {
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            budget_id: state.budgetData?.budget_id,
            query: {
                group_by: ['name', 'date', 'currency'],
                fields: {
                    budget_usage: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                sort: [{ key: 'date', desc: false }],
            },
        });
        state.data = results;
    } catch (error) {
        ErrorHandler.handleError(error);
    }
};

watch(() => state.budgetData, async () => {
    await fetchBudgetUsageAnalyze();
}, { deep: true, immediate: true });
</script>

<template>
    <div>
        <budget-usage-trend-monthly-chart :data="state.data" />
        <budget-usage-trend-monthly-table :data="state.data" />
    </div>
</template>
