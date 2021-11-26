<template>
    <div style="height: 315px; background-color: #fff;">
        <budget-usage-progress-bar :usage-rate="90" />
    </div>
</template>

<script lang="ts">
import BudgetUsageProgressBar
    from '@/services/billing/cost-management/modules/BudgetUsageProgressBar.vue';

export default {
    name: 'BudgetUsage',
    components: { BudgetUsageProgressBar },

    setup() {
        return {};
    },
};
</script>
