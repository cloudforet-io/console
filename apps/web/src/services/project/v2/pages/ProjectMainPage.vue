<script setup lang="ts">
import {
    computed,
    toRef,
} from 'vue';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import ProjectAndGroupListPanel from '@/services/project/v2/components/ProjectAndGroupListPanel.vue';
import ProjectDeleteModal from '@/services/project/v2/components/ProjectDeleteModal.vue';
import ProjectFormModal from '@/services/project/v2/components/ProjectFormModal.vue';
import ProjectGroupFormModal from '@/services/project/v2/components/ProjectGroupFormModal.vue';
import ProjectGroupMemberManagementModal from '@/services/project/v2/components/ProjectGroupMemberManagementModal.vue';
import ProjectGroupRenameModal from '@/services/project/v2/components/ProjectGroupRenameModal.vue';
import ProjectHeader from '@/services/project/v2/components/ProjectHeader.vue';
import ProjectMemberInviteModal from '@/services/project/v2/components/ProjectMemberInviteModal.vue';
import ProjectMemberManagementModal from '@/services/project/v2/components/ProjectMemberManagementModal.vue';
import ProjectMoveModal from '@/services/project/v2/components/ProjectMoveModal.vue';
import ProjectTagsModal from '@/services/project/v2/components/ProjectTagsModal.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

const props = defineProps<{
    projectGroupOrProjectId?: string;
}>();

/* project or group */
const { projectGroupId, projectId } = useProjectOrGroupId(toRef(props, 'projectGroupOrProjectId'));


/* modals */
const projectPageModelStore = useProjectPageModalStore();

/* target parent group id */
const { data: project } = useProjectQuery({
    projectId,
    enabled: computed(() => !!projectId),
});
const { data: projectGroup } = useProjectGroupQuery({
    projectGroupId,
    enabled: computed(() => !!projectGroupId),
});
const targetParentGroupId = computed<string|undefined>(() => {
    if (project.value) return project.value.project_group_id;
    if (projectGroup.value) return projectGroup.value.project_group_id;
    return undefined;
});

</script>

<template>
    <div class="flex flex-col w-full h-full">
        <project-header :project-id="projectId"
                        :project-group-id="projectGroupId"
        />
        <project-and-group-list-panel />
        <project-group-member-management-modal />
        <project-member-management-modal />
        <project-delete-modal :skip-redirect="!!projectPageModelStore.state.targetId &&
            (projectPageModelStore.state.targetId === projectGroupId || projectPageModelStore.state.targetId === projectId)"
        />
        <project-move-modal />
        <project-member-invite-modal :project-id="projectId" />
        <project-tags-modal />
        <project-form-modal :target-parent-group-id="targetParentGroupId" />
        <project-group-form-modal :target-parent-group-id="targetParentGroupId" />
        <project-group-rename-modal />
    </div>
</template>
