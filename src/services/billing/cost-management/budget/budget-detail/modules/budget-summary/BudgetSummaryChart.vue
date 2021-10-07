<template>
    <p-pane-layout class="budget-summary-chart-wrapper">
        <div class="card-header">
            Budget Summary
        </div>
        <div class="card-body">
            body
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout } from '@spaceone/design-system';

export default {
    name: 'BudgetDetailSummaryChart',
    components: {
        PPaneLayout,
    },

};
</script>

<style lang="postcss" scoped>
.budget-summary-chart-wrapper {
    @apply flex flex-col;
    min-width: 100%;
    min-height: 100%;
}
.card-header {
    @apply bg-gray-100 items-center;
    display: inherit;
    padding: 1rem 1rem;
    min-height: 4rem;
    font-size: 1.5rem;
    line-height: 135%;
}
</style>
