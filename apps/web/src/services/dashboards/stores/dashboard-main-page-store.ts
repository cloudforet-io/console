import { reactive } from 'vue';

import { defineStore } from 'pinia';


export const useDashboardMainPageStore = defineStore('page-dashboard-main', () => {
    const state = reactive({
        folderFormModalVisible: false,
        folderFormModalType: 'CREATE' as 'CREATE' | 'UPDATE',
        selectedFolderId: undefined as string | undefined,
        folderDeleteModalVisible: false,
        folderMoveModalVisible: false,
    });
    const getters = reactive({
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
    const setFolderDeleteModalVisible = (visible: boolean) => {
        state.folderDeleteModalVisible = visible;
    };
    const setFolderMoveModalVisible = (visible: boolean) => {
        state.folderMoveModalVisible = visible;
    };
    const mutations = {
        setFolderFormModalVisible,
        setFolderFormModalType,
        setSelectedFolderId,
        setFolderDeleteModalVisible,
        setFolderMoveModalVisible,
    };

    /* Actions */
    const reset = () => {
        setFolderFormModalVisible(false);
        setFolderFormModalType('CREATE');
        setSelectedFolderId(undefined);
        setFolderDeleteModalVisible(false);
        setFolderMoveModalVisible(false);
    };
    const actions = {
        reset,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
