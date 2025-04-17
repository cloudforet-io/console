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
        openDashboardEditOverlay() {
            state.dashboardEditOverlayVisible = true;
        },
        closeDashboardEditOverlay() {
            state.dashboardEditOverlayVisible = false;
        },
        openDashboardBundleDeleteModal() {
            state.dashboardBundleDeleteModalVisible = true;
        },
        closeDashboardBundleDeleteModal() {
            state.dashboardBundleDeleteModalVisible = false;
        },
        openDashboardBundleMoveModal() {
            state.dashboardBundleMoveModalVisible = true;
        },
        closeDashboardBundleMoveModal() {
            state.dashboardBundleMoveModalVisible = false;
        },
        openDashboardBundleCloneModal() {
            state.dashboardBundleCloneModalVisible = true;
        },
        closeDashboardBundleCloneModal() {
            state.dashboardBundleCloneModalVisible = false;
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
