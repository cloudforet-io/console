<template>
    <p-pane-layout class="budget-alert-wrapper">
        <div class="card-header">
            <span class="title">Budget Alert</span>
            <p-icon-button name="ic_trashcan" />
            <p-icon-button name="ic_setting" />
        </div>
        <div class="card-body">
            body
        </div>
    </p-pane-layout>
</template>

<script>
import { PPaneLayout, PIconButton } from '@spaceone/design-system';

export default {
    name: 'BudgetDetailAlert',
    components: {
        PPaneLayout,
        PIconButton,
    },
};
</script>

<style lang="postcss" scoped>
.budget-alert-wrapper {
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
    .title {
        margin-right: 0.5rem;
    }
}
</style>
