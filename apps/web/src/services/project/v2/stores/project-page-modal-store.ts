import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useProjectPageModalStore = defineStore('project-page-modal', () => {
    const state = reactive({
        manageMemberModalVisible: false,
        deleteModalVisible: false,
        moveModalVisible: false,
        inviteMemberModalVisible: false,
        manageTagsModalVisible: false,
        projectFormModalVisible: false,
        targetProjectId: '' as string|undefined,
        targetProjectGroupId: '' as string|undefined,
        targetType: undefined as 'project'|'projectGroup'|undefined,
    });

    const actions = {
        // manage member
        openProjectGroupManageMemberModal(targetProjectGroupId: string) {
            state.targetProjectGroupId = targetProjectGroupId;
            state.manageMemberModalVisible = true;
        },
        openProjectManageMemberModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.manageMemberModalVisible = true;
        },
        closeManageMemberModal() {
            state.manageMemberModalVisible = false;
        },
        // delete project
        openProjectGroupDeleteModal(targetProjectGroupId: string) {
            state.targetProjectGroupId = targetProjectGroupId;
            state.deleteModalVisible = true;
        },
        openProjectDeleteModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.deleteModalVisible = true;
        },
        closeDeleteModal() {
            state.deleteModalVisible = false;
        },
        // move project
        openProjectGroupMoveModal(targetProjectGroupId: string) {
            state.targetProjectGroupId = targetProjectGroupId;
            state.moveModalVisible = true;
        },
        openProjectMoveModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.moveModalVisible = true;
        },
        closeMoveModal() {
            state.moveModalVisible = false;
        },
        // invite member
        openProjectGroupInviteMemberModal(targetProjectGroupId: string) {
            state.targetProjectGroupId = targetProjectGroupId;
            state.inviteMemberModalVisible = true;
        },
        openProjectInviteMemberModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.inviteMemberModalVisible = true;
        },
        closeInviteMemberModal() {
            state.inviteMemberModalVisible = false;
        },
        // manage tags
        openProjectGroupManageTagsModal(targetProjectGroupId: string) {
            state.targetProjectGroupId = targetProjectGroupId;
            state.manageTagsModalVisible = true;
        },
        openProjectManageTagsModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.manageTagsModalVisible = true;
        },
        closeManageTagsModal() {
            state.manageTagsModalVisible = false;
        },
        // form
        openCreateProjectFormModal(targetType: 'project'|'projectGroup', targetProjectGroupId?: string) {
            state.targetType = targetType;
            state.targetProjectGroupId = targetProjectGroupId;
            state.projectFormModalVisible = true;
        },
        openEditProjectFormModal(targetProjectId: string) {
            state.targetProjectId = targetProjectId;
            state.projectFormModalVisible = true;
        },
        closeProjectFormModal() {
            state.projectFormModalVisible = false;
        },
        // overal
        resetTarget() {
            state.targetProjectId = '';
            state.targetProjectGroupId = '';
        },
    };

    return {
        state,
        ...actions,
    };
});
