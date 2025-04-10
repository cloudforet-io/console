<script setup lang="ts">
import { computed, toRef } from 'vue';

import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';

import AccountSummary from '@/services/workspace-home/shared/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/shared/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/shared/components/CostSummary.vue';
import { useProjectIdsFromGroup } from '@/services/workspace-home/shared/composables/use-project-ids-from-group';

const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const props = defineProps<{
    projectGroupId?: string;
    projectId?: string;
}>();
const childProjectIds = useProjectIdsFromGroup(toRef(props, 'projectGroupId'));
const projectIds = computed(() => (props.projectId ? [props.projectId] : childProjectIds.value));
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
                           :project-ids="projectIds"
            />
            <account-summary style-type="compact"
                             :project-ids="projectIds"
            />
        </div>
        <cost-summary style-type="compact"
                      :project-ids="projectIds"
        />
    </div>
</template>
