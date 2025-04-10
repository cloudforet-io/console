import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useProjectPageModalStore = defineStore('project-page-modal', () => {
    const state = reactive({
        targetId: '' as string|undefined,
        targetType: undefined as 'project'|'projectGroup'|undefined,

        manageMemberModalVisible: false,
        deleteModalVisible: false,
        moveModalVisible: false,
        inviteMemberModalVisible: false,
        manageTagsModalVisible: false,
        projectFormModalVisible: false,

        folderFormModalVisible: false,
        dashboardNameEditModalVisible: false,
        dashboardChangeFolderModalVisible: false,
        dashboardDeleteModalVisible: false,
    });

    const actions = {
        // manage member
        openProjectGroupManageMemberModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.manageMemberModalVisible = true;
        },
        openProjectManageMemberModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.manageMemberModalVisible = true;
        },
        closeManageMemberModal() {
            state.manageMemberModalVisible = false;
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
        // form
        openCreateProjectGroupFormModal() {
            state.targetId = undefined;
            state.targetType = 'projectGroup';
            state.projectFormModalVisible = true;
        },
        openCreateProjectFormModal() {
            state.targetId = undefined;
            state.targetType = 'project';
            state.projectFormModalVisible = true;
        },
        openEditProjectGroupFormModal(targetProjectGroupId: string) {
            state.targetId = targetProjectGroupId;
            state.targetType = 'projectGroup';
            state.projectFormModalVisible = true;
        },
        openEditProjectFormModal(targetProjectId: string) {
            state.targetId = targetProjectId;
            state.targetType = 'project';
            state.projectFormModalVisible = true;
        },
        closeFormModal() {
            state.projectFormModalVisible = false;
        },
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
