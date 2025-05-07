<script setup lang="ts">
import { computed, reactive } from 'vue';

import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetDetailBaseInformation from '@/services/cost-explorer/components/BudgetDetailBaseInformation.vue';
import BudgetDetailHeading from '@/services/cost-explorer/components/BudgetDetailHeading.vue';
import BudgetUsageTrend from '@/services/cost-explorer/components/BudgetUsageTrend.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';

interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const state = reactive({
    loading: true,
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
});

(async () => {
    state.loading = true;
    try {
        await Promise.allSettled([
            budgetPageStore.getBudgetData(props.budgetId),
            budgetPageStore.getBudgetUsageData(props.budgetId),
        ]);
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
})();

</script>

<template>
    <div>
        <budget-detail-heading :loading="state.loading" />
        <section class="content">
            <budget-detail-base-information />
            <budget-usage-trend />
            <!-- <budget-detail-info class="summary" />
            <budget-detail-summary
                :budget-loading="state.loading"
                class="summary"
            /> -->
        </section>
    </div>
</template>


<style lang="postcss" scoped>
.content {
    @apply flex flex-col;
    gap: 1rem;
    .summary {
        flex-grow: 1;
    }
}
</style>
