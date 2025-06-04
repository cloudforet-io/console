<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetUsageTrendTotalChart from '@/services/cost-explorer/components/BudgetUsageTrendTotalChart.vue';
import BudgetUsageTrendTotalTable from '@/services/cost-explorer/components/BudgetUsageTrendTotalTable.vue';
import { useBudgetGetQuery } from '@/services/cost-explorer/composables/use-budget-get-query';
import { useBudgetUsageQuery } from '@/services/cost-explorer/composables/use-budget-usage-query';

interface Props {
    budgetId: string;
}

const props = defineProps<Props>();

const { budgetData } = useBudgetGetQuery(props.budgetId);
const { budgetUsageAPI } = useBudgetUsageQuery();

const state = reactive({
    budgetData: computed(() => budgetData.value),
    data: [],
});

const fetchBudgetUsageAnalyze = async () => {
    try {
        const { results } = await budgetUsageAPI.analyze({
            budget_id: props.budgetId,
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
        <budget-usage-trend-total-chart :data="state.data"
                                        :budget-id="props.budgetId"
        />
        <budget-usage-trend-total-table :data="state.data"
                                        :budget-id="props.budgetId"
        />
    </div>
</template>
