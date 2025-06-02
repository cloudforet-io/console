<script setup lang="ts">
import { computed } from 'vue';

import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';

import { useProjectChildrenListQuery } from '@/services/project/v2/composables/queries/use-project-children-list-query';
import AccountSummary from '@/services/workspace-home/shared/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/shared/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/shared/components/CostSummary.vue';


const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const props = defineProps<{
    projectGroupId?: string;
    projectId?: string;
}>();

const { data: projectChildrenList } = useProjectChildrenListQuery(computed(() => props.projectGroupId));

const projectIds = computed(() => {
    if (props.projectId) {
        return [props.projectId];
    }
    if (props.projectGroupId) {
        return projectChildrenList.value?.map((i) => i.project_id) ?? [];
    }
    return [];
});
</script>

<template>
    <div>
        <div class="bg-gray-100 py-1 border-gray-100 border-x overflow-hidden">
            <div class="flex space-x-1 tablet:flex-wrap">
                <asset-summary v-if="visibleContents"
                               mode="project"
                               :project-ids="projectIds"
                               class="w-1/2 tablet:w-full bg-white rounded-lg"
                />
                <account-summary mode="project"
                                 :project-ids="projectIds"
                                 class="w-1/2 tablet:w-full bg-white rounded-lg"
                />
            </div>
        </div>
        <cost-summary mode="project"
                      :project-ids="projectIds"
                      class="bg-white rounded-lg"
        />
    </div>
</template>
