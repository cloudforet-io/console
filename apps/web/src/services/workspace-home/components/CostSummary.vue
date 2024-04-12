<script setup lang="ts">
import { PFieldTitle } from '@spaceone/design-system';
</script>

<template>
    <div class="cost-summary">
        <p-field-title :label="$t('HOME.COST_SUMMARY_TITLE')"
                       size="lg"
                       class="main-title"
        />
    </div>
</template>

<style scoped lang="postcss">
.cost-summary {
    .main-title {
        padding-bottom: 1.375rem;
        padding-left: 1rem;
    }
}
</style>
