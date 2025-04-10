<script setup lang="ts">
import {
    computed,
    toRef,
    onMounted,
    ref,
    nextTick,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { useProjectGroupQuery } from '@/services/project/v-shared/composables/queries/use-project-group-query';
import ProjectAndGroupListPanel from '@/services/project/v2/components/ProjectAndGroupListPanel.vue';
import ProjectHeader from '@/services/project/v2/components/ProjectHeader.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

/* modals */
const ProjectDetailTab = () => import('@/services/project/v2/components/ProjectDetailTab.vue');
const ProjectGroupMemberManagementModal = () => import('@/services/project/v2/components/ProjectGroupMemberManagementModal.vue');
const ProjectMemberManagementModal = () => import('@/services/project/v2/components/ProjectMemberManagementModal.vue');
const ProjectDeleteModal = () => import('@/services/project/v2/components/ProjectDeleteModal.vue');
const ProjectMoveModal = () => import('@/services/project/v2/components/ProjectMoveModal.vue');
const ProjectMemberInviteModal = () => import('@/services/project/v2/components/ProjectMemberInviteModal.vue');
const ProjectTagsModal = () => import('@/services/project/v2/components/ProjectTagsModal.vue');
const ProjectFormModal = () => import('@/services/project/v2/components/ProjectFormModal.vue');
const ProjectGroupFormModal = () => import('@/services/project/v2/components/ProjectGroupFormModal.vue');
const ProjectDashboardFolderFormModal = () => import('@/services/project/v2/components/ProjectDashboardFolderFormModal.vue');
const ProjectDashboardNameEditModal = () => import('@/services/project/v2/components/ProjectDashboardNameEditModal.vue');
const ProjectDashboardChangeFolderModal = () => import('@/services/project/v2/components/ProjectDashboardChangeFolderModal.vue');
const ProjectDashboardDeleteModal = () => import('@/services/project/v2/components/ProjectDashboardDeleteModal.vue');
const ProjectDashboardCloneModal = () => import('@/services/project/v2/components/ProjectDashboardCloneModal.vue');
const props = defineProps<{
    projectGroupOrProjectId?: string;
    dashboardId?: string;
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

/* after deleted */
const router = useRouter();
const handleDeleted = () => {
    const id = projectPageModelStore.state.targetId;
    if (id && (id === projectGroupId.value || id === projectId.value)) {
        router.replace({
            name: PROJECT_ROUTE_V2._NAME,
        });
    }
};

/* after created */
const handleCreated = (id: string) => {
    router.replace({
        name: PROJECT_ROUTE_V2._NAME,
        params: {
            projectGroupOrProjectId: id,
        },
    });
};

/* mounted */
const mounted = ref(false);
onMounted(() => {
    nextTick(() => {
        mounted.value = true;
    });
});

/* dashboard tab */
const handleUpdateDashboardId = (id?: string) => {
    if (!props.projectGroupOrProjectId) return;
    if (!id) {
        router.replace({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: props.projectGroupOrProjectId,
            },
        }).catch(() => {});
    } else {
        router.replace({
            name: PROJECT_ROUTE_V2._NAME,
            params: {
                projectGroupOrProjectId: props.projectGroupOrProjectId,
                dashboardId: id,
            },
        }).catch(() => {});
    }
};

</script>

<template>
    <div class="flex flex-col w-full h-full">
        <project-header :project-id="projectId"
                        :project-group-id="projectGroupId"
        />
        <keep-alive>
            <project-and-group-list-panel v-if="mounted"
                                          :key="props.projectGroupOrProjectId ?? 'all'"
                                          class="mt-4"
                                          :target-id="props.projectGroupOrProjectId"
                                          :target-type="props.projectGroupOrProjectId ? (projectId ? 'project' : 'projectGroup') : undefined"
            />
        </keep-alive>
        <project-detail-tab v-if="mounted && props.projectGroupOrProjectId"
                            :project-id="projectId"
                            :project-group-id="projectGroupId"
                            :dashboard-id="props.dashboardId"
                            @update:dashboard-id="handleUpdateDashboardId"
        />

        <template v-if="mounted">
            <project-group-member-management-modal v-if="projectPageModelStore.state.manageMemberModalVisible && projectPageModelStore.state.targetType === 'projectGroup'" />
            <project-member-management-modal v-if="projectPageModelStore.state.manageMemberModalVisible && projectPageModelStore.state.targetType === 'project'" />
            <project-delete-modal v-if="projectPageModelStore.state.deleteModalVisible"
                                  @deleted="handleDeleted"
            />
            <project-move-modal v-if="projectPageModelStore.state.moveModalVisible" />
            <project-member-invite-modal v-if="projectPageModelStore.state.inviteMemberModalVisible" />
            <project-tags-modal v-if="projectPageModelStore.state.manageTagsModalVisible" />
            <project-form-modal v-if="projectPageModelStore.state.projectFormModalVisible && projectPageModelStore.state.targetType === 'project'"
                                :target-parent-group-id="targetParentGroupId"
                                @created="handleCreated"
            />
            <project-group-form-modal v-if="projectPageModelStore.state.projectFormModalVisible && projectPageModelStore.state.targetType === 'projectGroup'"
                                      :target-parent-group-id="targetParentGroupId"
                                      @created="handleCreated"
            />
            <project-dashboard-folder-form-modal v-if="projectPageModelStore.state.folderFormModalVisible"
                                                 :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-name-edit-modal v-if="projectPageModelStore.state.dashboardNameEditModalVisible"
                                               :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-change-folder-modal v-if="projectPageModelStore.state.dashboardChangeFolderModalVisible"
                                                   :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-delete-modal v-if="projectPageModelStore.state.dashboardDeleteModalVisible"
                                            :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-clone-modal v-if="projectPageModelStore.state.dashboardCloneModalVisible"
                                           :project-group-or-project-id="props.projectGroupOrProjectId"
            />
        </template>
    </div>
</template>
