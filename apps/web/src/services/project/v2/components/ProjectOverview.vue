<script setup lang="ts">
import { computed } from 'vue';

import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { MENU_ID } from '@/lib/menu/config';

import { useContentsAccessibility } from '@/common/composables/contents-accessibility';

import AccountSummary from '@/services/workspace-home/shared/components/AccountSummary.vue';
import AssetSummary from '@/services/workspace-home/shared/components/AssetSummary.vue';
import CostSummary from '@/services/workspace-home/shared/components/CostSummary.vue';


const { visibleContents } = useContentsAccessibility(MENU_ID.ASSET_INVENTORY);

const props = defineProps<{
    projectGroupId?: string;
    projectId?: string;
}>();

const { projectAPI } = useProjectApi();
const { key: projectListQueryKey, params: projectListQueryParams } = useServiceQueryKey('identity', 'project', 'list', {
    params: computed(() => ({
        project_group_id: props.projectGroupId,
        include_children: true,
    })),
});
const { data: projectListData } = useScopedQuery({
    queryKey: projectListQueryKey,
    queryFn: () => projectAPI.list(projectListQueryParams.value),
}, ['DOMAIN', 'WORKSPACE']);
const projectIds = computed(() => {
    if (props.projectId) {
        return [props.projectId];
    }
    if (props.projectGroupId) {
        return projectListData.value?.results?.map((i) => i.project_id) ?? [];
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
