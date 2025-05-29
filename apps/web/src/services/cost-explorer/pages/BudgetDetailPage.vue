<script setup lang="ts">
import { computed, reactive } from 'vue';

import BudgetDetailBaseInformation from '@/services/cost-explorer/components/BudgetDetailBaseInformation.vue';
import BudgetDetailHeading from '@/services/cost-explorer/components/BudgetDetailHeading.vue';
import BudgetUsageTrend from '@/services/cost-explorer/components/BudgetUsageTrend.vue';

interface Props {
  budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const state = reactive({
    isWorkspaceTarget: computed<boolean>(() => (state.budgetData?.resource_group === 'WORKSPACE')),
});
</script>

<template>
    <div>
        <budget-detail-heading :budget-id="props.budgetId" />
        <section class="content">
            <budget-detail-base-information :budget-id="props.budgetId" />
            <budget-usage-trend :budget-id="props.budgetId" />
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
    .alert {
        flex-grow: 1;
    }
}
.notification-link {
    @apply text-label-md;
}
</style>
