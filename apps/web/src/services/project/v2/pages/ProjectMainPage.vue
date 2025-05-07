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
import ProjectDashboardEditListOverlay from '@/services/project/v2/components/ProjectDashboardEditListOverlay.vue';
import ProjectHeader from '@/services/project/v2/components/ProjectHeader.vue';
import { useProjectQuery } from '@/services/project/v2/composables/queries/use-project-query';
import { useProjectOrGroupId } from '@/services/project/v2/composables/use-project-or-group-id';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { useProjectDashboardModalStore } from '@/services/project/v2/stores/Project-dashboard-modal-store';
import { useProjectPageModalStore } from '@/services/project/v2/stores/project-page-modal-store';

/* modals */
const ProjectDetailTab = () => import('@/services/project/v2/components/ProjectDetailTab.vue');
const ProjectGroupMemberManagementModal = () => import('@/services/project/v2/components/ProjectGroupMemberManagementModal.vue');
const ProjectMemberManagementModal = () => import('@/services/project/v2/components/ProjectMemberManagementModal.vue');
const ProjectDeleteModal = () => import('@/services/project/v2/components/ProjectDeleteModal.vue');
const ProjectMoveModal = () => import('@/services/project/v2/components/ProjectMoveModal.vue');
const ProjectMemberInviteModal = () => import('@/services/project/v2/components/ProjectMemberInviteModal.vue');
const ProjectTagsModal = () => import('@/services/project/v2/components/ProjectTagsModal.vue');
const ProjectCreateModal = () => import('@/services/project/v2/components/ProjectCreateModal.vue');
const ProjectRenameModal = () => import('@/services/project/v2/components/ProjectRenameModal.vue');
const ProjectEditAccessModal = () => import('@/services/project/v2/components/ProjectEditAccessModal.vue');
const ProjectGroupCreateModal = () => import('@/services/project/v2/components/ProjectGroupCreateModal.vue');
const ProjectGroupRenameModal = () => import('@/services/project/v2/components/ProjectGroupRenameModal.vue');
const ProjectDashboardFolderFormModal = () => import('@/services/project/v2/components/ProjectDashboardFolderFormModal.vue');
const ProjectDashboardNameEditModal = () => import('@/services/project/v2/components/ProjectDashboardNameEditModal.vue');
const ProjectDashboardChangeFolderModal = () => import('@/services/project/v2/components/ProjectDashboardChangeFolderModal.vue');
const ProjectDashboardDeleteModal = () => import('@/services/project/v2/components/ProjectDashboardDeleteModal.vue');
const ProjectDashboardCloneModal = () => import('@/services/project/v2/components/ProjectDashboardCloneModal.vue');
const ProjectDashboardBundleDeleteModal = () => import('@/services/project/v2/components/ProjectDashboardBundleDeleteModal.vue');
const ProjectDashboardBundleMoveModal = () => import('@/services/project/v2/components/ProjectDashboardBundleMoveModal.vue');
const ProjectDashboardBundleCloneModal = () => import('@/services/project/v2/components/ProjectDashboardBundleCloneModal.vue');

const props = defineProps<{
    projectGroupOrProjectId?: string;
    dashboardId?: string;
}>();

/* project or group */
const { projectGroupId, projectId } = useProjectOrGroupId(toRef(props, 'projectGroupOrProjectId'));


/* modals */
const projectPageModelStore = useProjectPageModalStore();
const projectDashboardModalStore = useProjectDashboardModalStore();

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
            <project-and-group-list-panel v-if="mounted && !projectId"
                                          :key="projectGroupId ?? 'all'"
                                          class="mt-4"
                                          :project-group-id="projectGroupId"
            />
        </keep-alive>
        <project-detail-tab v-if="mounted && props.projectGroupOrProjectId"
                            class="mt-6"
                            :project-id="projectId"
                            :project-group-id="projectGroupId"
                            :dashboard-id="props.dashboardId"
                            @update:dashboard-id="handleUpdateDashboardId"
        />

        <keep-alive v-if="mounted">
            <project-group-member-management-modal v-if="projectPageModelStore.state.projectGroupMemberModalVisible" />
            <project-member-management-modal v-if="projectPageModelStore.state.projectMemberModalVisible" />
            <project-delete-modal v-if="projectPageModelStore.state.deleteModalVisible"
                                  @deleted="handleDeleted"
            />
            <project-move-modal v-if="projectPageModelStore.state.moveModalVisible" />
            <project-member-invite-modal v-if="projectPageModelStore.state.inviteMemberModalVisible" />
            <project-tags-modal v-if="projectPageModelStore.state.manageTagsModalVisible" />

            <project-create-modal v-if="projectPageModelStore.state.projectCreateModalVisible"
                                  :target-parent-group-id="targetParentGroupId"
                                  @created="handleCreated"
            />
            <project-rename-modal v-if="projectPageModelStore.state.projectRenameModalVisible" />
            <project-edit-access-modal v-if="projectPageModelStore.state.projectEditAccessModalVisible" />

            <project-group-create-modal v-if="projectPageModelStore.state.projectGroupCreateModalVisible"
                                        :target-parent-group-id="targetParentGroupId"
                                        @created="handleCreated"
            />
            <project-group-rename-modal v-if="projectPageModelStore.state.projectGroupRenameModalVisible" />
            <project-dashboard-edit-list-overlay v-if="projectDashboardModalStore.state.dashboardEditOverlayVisible"
                                                 :project-group-or-project-id="props.projectGroupOrProjectId"
            />
        </keep-alive>
        <template v-if="mounted">
            <project-dashboard-folder-form-modal v-if="projectDashboardModalStore.state.folderFormModalVisible"
                                                 :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-name-edit-modal v-if="projectDashboardModalStore.state.dashboardNameEditModalVisible"
                                               :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-change-folder-modal v-if="projectDashboardModalStore.state.dashboardChangeFolderModalVisible"
                                                   :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-delete-modal v-if="projectDashboardModalStore.state.dashboardDeleteModalVisible"
                                            :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-clone-modal v-if="projectDashboardModalStore.state.dashboardCloneModalVisible"
                                           :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-bundle-delete-modal v-if="projectDashboardModalStore.state.dashboardBundleDeleteModalVisible"
                                                   :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-bundle-move-modal v-if="projectDashboardModalStore.state.dashboardBundleMoveModalVisible"
                                                 :project-group-or-project-id="props.projectGroupOrProjectId"
            />
            <project-dashboard-bundle-clone-modal v-if="projectDashboardModalStore.state.dashboardBundleCloneModalVisible"
                                                  :project-group-or-project-id="props.projectGroupOrProjectId"
            />
        </template>
    </div>
</template>
