<script setup lang="ts">
import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';

import AccountSummary from '@/services/workspace-home/shared/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/shared/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/shared/components/CostSummary.vue';

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);
</script>

<template>
    <div class="summaries-wrapper">
        <div class="summaries">
            <asset-summary v-if="visibleContents"
                           class="box-wrapper"
            />
            <account-summary class="box-wrapper" />
        </div>
        <cost-summary class="box-wrapper cost" />
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
        border-radius: 0.375rem;
        flex: 1;
        &.cost {
            @apply w-full;
            max-width: initial;
        }
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
