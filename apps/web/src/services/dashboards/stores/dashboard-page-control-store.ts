import { reactive } from 'vue';

import { defineStore } from 'pinia';

export const useDashboardPageControlStore = defineStore('page-dashboard-control', () => {
    const state = reactive({
        // folder
        folderFormModalVisible: false,
        folderFormModalType: 'CREATE' as 'CREATE' | 'UPDATE',
        folderModalType: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
        selectedFolderId: undefined as string | undefined,
        // dashboard
        dashboardNameEditModalVisible: false,
        dashboardDeleteModalVisible: false,
        dashboardCloneModalVisible: false,
        dashboardShareWithCodeModalVisible: false,
        dashboardFolderSingleMoveModalVisible: false,
        selectedDashboardId: undefined as string | undefined,
        // bundle
        bundleShareModalVisible: false,
        bundleMoveModalVisible: false,
        bundleCloneModalVisible: false,
        bundleDeleteModalVisible: false,
    });

    /* Mutations */
    const setFolderFormModalVisible = (visible: boolean) => {
        state.folderFormModalVisible = visible;
    };
    const setFolderFormModalType = (type: 'CREATE' | 'UPDATE') => {
        state.folderFormModalType = type;
    };
    const setSelectedFolderId = (folderId: string | undefined) => {
        state.selectedFolderId = folderId;
    };
    const setFolderModalType = (type: 'PUBLIC' | 'PRIVATE') => {
        state.folderModalType = type;
    };
    const setDashboardNameEditModalVisible = (visible: boolean) => { state.dashboardNameEditModalVisible = visible; };
    const setDashboardDeleteModalVisible = (visible: boolean) => { state.dashboardDeleteModalVisible = visible; };
    const setDashboardCloneModalVisible = (visible: boolean) => { state.dashboardCloneModalVisible = visible; };
    const setDashboardShareWithCodeModalVisible = (visible: boolean) => { state.dashboardShareWithCodeModalVisible = visible; };
    const setDashboardFolderSingleMoveModalVisible = (visible: boolean) => { state.dashboardFolderSingleMoveModalVisible = visible; };
    const setBundleShareModalVisible = (visible: boolean) => { state.bundleShareModalVisible = visible; };
    const setBundleMoveModalVisible = (visible: boolean) => { state.bundleMoveModalVisible = visible; };
    const setBundleCloneModalVisible = (visible: boolean) => { state.bundleCloneModalVisible = visible; };
    const setBundleDeleteModalVisible = (visible: boolean) => { state.bundleDeleteModalVisible = visible; };
    const setSelectedDashboardId = (dashboardId: string | undefined) => { state.selectedDashboardId = dashboardId; };
    const mutations = {
        setFolderFormModalVisible,
        setFolderFormModalType,
        setSelectedFolderId,
        setBundleDeleteModalVisible,
        setFolderModalType,
        setBundleCloneModalVisible,
        setBundleShareModalVisible,
        setDashboardNameEditModalVisible,
        setDashboardDeleteModalVisible,
        setDashboardCloneModalVisible,
        setDashboardShareWithCodeModalVisible,
        setDashboardFolderSingleMoveModalVisible,
        setBundleMoveModalVisible,
        setSelectedDashboardId,
    };

    /* Actions */
    const reset = () => {
        state.folderFormModalVisible = false;
        state.dashboardNameEditModalVisible = false;
        state.dashboardDeleteModalVisible = false;
        state.dashboardCloneModalVisible = false;
        state.dashboardShareWithCodeModalVisible = false;
        state.dashboardFolderSingleMoveModalVisible = false;
        state.bundleShareModalVisible = false;
        state.bundleMoveModalVisible = false;
        state.bundleCloneModalVisible = false;
        state.bundleDeleteModalVisible = false;
        state.selectedFolderId = undefined;
        state.selectedDashboardId = undefined;
    };


    // Single (Folder or Dashboard)
    const openEditNameModal = (id: string) => {
        if (id.includes('folder')) {
            state.folderFormModalType = 'UPDATE';
            state.selectedFolderId = id;
            state.folderFormModalVisible = true;
        } else {
            state.selectedDashboardId = id;
            state.dashboardNameEditModalVisible = true;
        }
    };
    const openShareModal = (id: string) => {
        if (id.includes('folder')) {
            state.selectedFolderId = id;
            state.bundleShareModalVisible = true;
        } else {
            state.selectedDashboardId = id;
            state.bundleShareModalVisible = true;
        }
    };
    const openShareWithCodeModal = (dashboardId: string) => {
        state.selectedDashboardId = dashboardId;
        state.dashboardShareWithCodeModalVisible = true;
    };
    const openCloneModal = (id: string) => {
        if (id.includes('folder')) {
            state.selectedFolderId = id;
            state.bundleCloneModalVisible = true;
        } else {
            state.selectedDashboardId = id;
            state.dashboardCloneModalVisible = true;
        }
    };
    const openDeleteModal = (id: string) => {
        if (id.includes('folder')) {
            state.selectedFolderId = id;
            state.bundleDeleteModalVisible = true;
        } else {
            state.selectedDashboardId = id;
            state.dashboardDeleteModalVisible = true;
        }
    };
    const openMoveModal = (dashboardId: string) => {
        state.selectedDashboardId = dashboardId;
        state.dashboardFolderSingleMoveModalVisible = true;
    };

    // Bundle (Folder + Dashboard)
    const openBundleCloneModal = (type: 'PRIVATE'|'PUBLIC') => {
        state.folderModalType = type;
        state.bundleCloneModalVisible = true;
    };
    const openBundleMoveModal = (type: 'PRIVATE'|'PUBLIC') => {
        state.folderModalType = type;
        state.bundleMoveModalVisible = true;
    };
    const openBundleDeleteModal = (type: 'PRIVATE'|'PUBLIC') => {
        state.folderModalType = type;
        state.bundleDeleteModalVisible = true;
    };
    const closeBundleCloneModal = () => {
        state.bundleCloneModalVisible = false;
        state.selectedFolderId = undefined;
    };
    const closeBundleDeleteModal = () => {
        state.bundleDeleteModalVisible = false;
        state.selectedFolderId = undefined;
    };
    const actions = {
        reset,
        openEditNameModal,
        openShareModal,
        openShareWithCodeModal,
        openCloneModal,
        openDeleteModal,
        openMoveModal,
        openBundleCloneModal,
        openBundleMoveModal,
        openBundleDeleteModal,
        closeBundleCloneModal,
        closeBundleDeleteModal,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
