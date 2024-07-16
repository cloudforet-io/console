<script setup lang="ts">
import AccountSummary from '@/services/workspace-home/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/components/CostSummary.vue';
</script>

<template>
    <div class="summaries-wrapper">
        <div class="summaries">
            <asset-summary class="box-wrapper" />
            <account-summary class="box-wrapper" />
        </div>
        <cost-summary class="box-wrapper" />
    </div>
</template>

<style scoped lang="postcss">
.summaries-wrapper {
    @apply flex flex-col;
    gap: 1rem;
    .summaries {
        @apply flex;
        gap: 1rem;
    }

    .box-wrapper {
        @apply bg-white border border-gray-200 text-label-md;
        width: calc(50% - 0.5rem);
        max-width: 43rem;
        padding-top: 1.375rem;
        border-radius: 0.375rem;
        flex: 1;
    }

    @screen laptop {
        .summaries {
            @apply flex-col;
        }
        .box-wrapper {
            @apply w-full;
            max-width: initial;
        }
    }
}
</style>
