<template>
    <p-pane-layout class="budget-summary-chart-wrapper">
        test
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
    min-width: 100%;
    min-height: 38.125rem;
}
</style>
