import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useProjectDashboardModalStore = defineStore('project-dashboard-modal', () => {
    const state = reactive({
        targetId: '' as string|undefined,

        folderFormModalVisible: false,
        dashboardNameEditModalVisible: false,
        dashboardChangeFolderModalVisible: false,
        dashboardDeleteModalVisible: false,
        dashboardCloneModalVisible: false,
        dashboardEditOverlayVisible: false,
        dashboardBundleDeleteModalVisible: false,
        dashboardBundleMoveModalVisible: false,
        dashboardBundleCloneModalVisible: false,
    });

    const actions = {
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
            state.targetId = undefined;
        },
        openDashboardNameEditModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardNameEditModalVisible = true;
        },
        closeDashboardNameEditModal() {
            state.dashboardNameEditModalVisible = false;
            state.targetId = undefined;
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
            state.targetId = undefined;
        },
        openDashboardCloneModal(targetDashboardId: string) {
            state.targetId = targetDashboardId;
            state.dashboardCloneModalVisible = true;
        },
        closeDashboardCloneModal() {
            state.dashboardCloneModalVisible = false;
            state.targetId = undefined;
        },
        openDashboardEditOverlay() {
            state.dashboardEditOverlayVisible = true;
        },
        closeDashboardEditOverlay() {
            state.dashboardEditOverlayVisible = false;
            state.targetId = undefined;
        },
        openDashboardBundleDeleteModal() {
            state.dashboardBundleDeleteModalVisible = true;
        },
        closeDashboardBundleDeleteModal() {
            state.dashboardBundleDeleteModalVisible = false;
            state.targetId = undefined;
        },
        openDashboardBundleMoveModal() {
            state.dashboardBundleMoveModalVisible = true;
        },
        closeDashboardBundleMoveModal() {
            state.dashboardBundleMoveModalVisible = false;
            state.targetId = undefined;
        },
        openDashboardBundleCloneModal(targetFolderId?: string) {
            state.dashboardBundleCloneModalVisible = true;
            state.targetId = targetFolderId;
        },
        closeDashboardBundleCloneModal() {
            state.dashboardBundleCloneModalVisible = false;
            state.targetId = undefined;
        },
        resetTarget() {
            state.targetId = undefined;
        },
    };

    return {
        state,
        ...actions,
    };
});
