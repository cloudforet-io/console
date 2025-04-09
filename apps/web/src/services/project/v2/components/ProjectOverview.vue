<script setup lang="ts">
import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';

import AccountSummary from '@/services/workspace-home/shared/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/shared/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/shared/components/CostSummary.vue';

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

// const props = defineProps<{
//     projectGroupId?: string;
//     projectId?: string;
// }>();
</script>

<template>
    <div>
        <div class="px-6 pt-8">
            <p class="pb-4 text-label-xl text-gray-800 font-bold">
                Overview
            </p>
        </div>
        <div>
            <asset-summary v-if="visibleContents"
                           style-type="compact"
            />
            <account-summary style-type="compact" />
        </div>
        <cost-summary style-type="compact" />
    </div>
</template>
