<template>
    <budget-usage-progress-bar :usage-rate="90" />
</template>

<script lang="ts">
import BudgetUsageProgressBar
    from '@/services/billing/cost-management/cost-dashboard/widgets/modules/BudgetUsageProgressBar.vue';

export default {
    name: 'BudgetUsage',
    components: { BudgetUsageProgressBar },

    setup() {
        return {};
    },
};
</script>
