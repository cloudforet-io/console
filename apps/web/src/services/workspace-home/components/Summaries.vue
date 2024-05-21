<script setup lang="ts">
import AssetSummary from '@/services/workspace-home/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/components/CostSummary.vue';
</script>

<template>
    <div class="summaries">
        <asset-summary class="box-wrapper" />
        <cost-summary class="box-wrapper" />
    </div>
</template>

<style scoped lang="postcss">
.summaries {
    @apply flex;
    gap: 1rem;
    .box-wrapper {
        @apply bg-white border border-gray-200 text-label-md;
        width: calc(50% - 0.5rem);
        max-width: 43rem;
        padding-top: 1.375rem;
        border-radius: 0.375rem;
        flex: 1;
    }

    @screen laptop {
        @apply flex-col;
        .box-wrapper {
            @apply w-full;
            max-width: initial;
        }
    }
}
</style>
