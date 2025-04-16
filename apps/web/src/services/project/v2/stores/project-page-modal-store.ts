import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useProjectPageModalStore = defineStore('project-page-modal', () => {
    const state = reactive({
        targetId: '' as string|undefined,
        targetType: undefined as 'project'|'projectGroup'|undefined,

        projectGroupMemberModalVisible: false,
        projectMemberModalVisible: false,
        deleteModalVisible: false,
        moveModalVisible: false,
        inviteMemberModalVisible: false,
        manageTagsModalVisible: false,

        projectCreateModalVisible: false,
        projectRenameModalVisible: false,
        projectGroupCreateModalVisible: false,
        projectGroupRenameModalVisible: false,
        projectEditAccessModalVisible: false,

        folderFormModalVisible: false,
        dashboardNameEditModalVisible: false,
        dashboardChangeFolderModalVisible: false,
        dashboardDeleteModalVisible: false,
        dashboardCloneModalVisible: false,
    });

    const actions = {
        // project group member
        openProjectGroupMemberModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.projectGroupMemberModalVisible = true;
        },
        closeProjectGroupMemberModal() {
            state.projectGroupMemberModalVisible = false;
        },
        // project member
        openProjectMemberModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.projectMemberModalVisible = true;
        },
        closeProjectMemberModal() {
            state.projectMemberModalVisible = false;
        },
        // delete project
        openProjectGroupDeleteModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.deleteModalVisible = true;
        },
        openProjectDeleteModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.deleteModalVisible = true;
        },
        closeDeleteModal() {
            state.deleteModalVisible = false;
        },
        // move project
        openProjectGroupMoveModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.moveModalVisible = true;
        },
        openProjectMoveModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.moveModalVisible = true;
        },
        closeMoveModal() {
            state.moveModalVisible = false;
        },
        // invite member
        openProjectGroupInviteMemberModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.inviteMemberModalVisible = true;
        },
        openProjectInviteMemberModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.inviteMemberModalVisible = true;
        },
        closeInviteMemberModal() {
            state.inviteMemberModalVisible = false;
        },
        // manage tags
        openProjectGroupManageTagsModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.manageTagsModalVisible = true;
        },
        openProjectManageTagsModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.manageTagsModalVisible = true;
        },
        closeManageTagsModal() {
            state.manageTagsModalVisible = false;
        },
        // create project
        openProjectCreateModal(parentGroupId?: string) {
            state.targetId = parentGroupId;
            state.targetType = 'project';
            state.projectCreateModalVisible = true;
        },
        closeProjectCreateModal() {
            state.projectCreateModalVisible = false;
        },
        // rename project
        openProjectRenameModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.projectRenameModalVisible = true;
        },
        closeProjectRenameModal() {
            state.projectRenameModalVisible = false;
        },
        // create project group
        openProjectGroupCreateModal(parentGroupId?: string) {
            state.targetId = parentGroupId;
            state.targetType = 'projectGroup';
            state.projectGroupCreateModalVisible = true;
        },
        closeProjectGroupCreateModal() {
            state.projectGroupCreateModalVisible = false;
        },
        // rename project group
        openProjectGroupRenameModal(targetGroupId: string) {
            state.targetId = targetGroupId;
            state.targetType = 'projectGroup';
            state.projectGroupRenameModalVisible = true;
        },
        closeProjectGroupRenameModal() {
            state.projectGroupRenameModalVisible = false;
        },
        // edit access
        openProjectEditAccessModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.projectEditAccessModalVisible = true;
        },
        closeEditAccessModal() {
            state.projectEditAccessModalVisible = false;
        },
        // dashboards
        openCreateFolderFormModal() {
            state.targetId = undefined;
            state.folderFormModalVisible = true;
        },
        openEditFolderFormModal(targetFolderId: string) {
            state.targetId = targetFolderId;
            state.folderFormModalVisible = true;
        },
        closeFolderFormModal() {
            state.folderFormModalVisible = false;
        },
        openDashboardNameEditModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardNameEditModalVisible = true;
        },
        closeDashboardNameEditModal() {
            state.dashboardNameEditModalVisible = false;
        },
        openDashboardChangeFolderModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardChangeFolderModalVisible = true;
        },
        closeDashboardChangeFolderModal() {
            state.dashboardChangeFolderModalVisible = false;
        },
        openDashboardDeleteModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardDeleteModalVisible = true;
        },
        closeDashboardDeleteModal() {
            state.dashboardDeleteModalVisible = false;
        },
        openDashboardCloneModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardCloneModalVisible = true;
        },
        closeDashboardCloneModal() {
            state.dashboardCloneModalVisible = false;
        },
        resetTarget() {
            state.targetId = undefined;
            state.targetType = undefined;
        },
    };

    return {
        state,
        ...actions,
    };
});
