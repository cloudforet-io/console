import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';
import type { QueryTag } from '@cloudforet/mirinae/src/inputs/search/query-search-tags/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    convertTreeDataToDataTableItems,
    getDashboardTreeData, getSelectedTreeData,
} from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import type { DashboardTreeDataType, DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';



const _isControlButtonDisabled = (selectedPublicTreeData: TreeNode<DashboardTreeDataType>[]): boolean => {
    if (selectedPublicTreeData.length === 0) return true;
    let result = false;
    selectedPublicTreeData.forEach((node) => {
        if (result) return;
        if (node.data.type === 'FOLDER') {
            node.children?.forEach((child) => {
                if (child.data.shared) result = true;
            });
        } else if (node.data.shared) result = true;
    });
    return result;
};
export const useDashboardMainPageStore = defineStore('page-dashboard-main', () => {
    const appContextStore = useAppContextStore();
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
    const state = reactive({
        loading: false,
        publicDashboardList: [] as PublicDashboardModel[],
        privateDashboardList: [] as PrivateDashboardModel[],
        publicFolderList: [] as PublicFolderModel[],
        privateFolderList: [] as PrivateFolderModel[],
        // modal
        folderFormModalVisible: false,
        folderFormModalType: 'CREATE' as 'CREATE' | 'UPDATE',
        folderModalType: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
        folderDeleteModalVisible: false,
        folderMoveModalVisible: false,
        folderCloneModalVisible: false,
        folderShareModalVisible: false,
        selectedFolderId: undefined as string | undefined,
        selectedPublicIdMap: {} as Record<string, boolean>,
        selectedPrivateIdMap: {} as Record<string, boolean>,
        newIdList: [] as string[],
        searchFilters: [] as ConsoleFilter[],
        searchQueryTags: [] as QueryTag[],
    });
    const getters = reactive({
        // admin
        adminTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPublicTreeData.length === 0,
            move: getters.selectedPublicTreeData.length === 0,
            delete: getters.selectedPublicTreeData.length === 0,
        })),
        // public
        publicDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(state.publicFolderList, state.publicDashboardList, state.newIdList)),
        selectedPublicTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getSelectedTreeData(getters.publicDashboardTreeData, state.selectedPublicIdMap)),
        publicModalTableItems: computed<DashboardDataTableItem[]>(() => convertTreeDataToDataTableItems(getters.publicDashboardTreeData, getters.selectedPublicTreeData)),
        publicTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPublicTreeData.length === 0,
            move: _isControlButtonDisabled(getters.selectedPublicTreeData),
            delete: _isControlButtonDisabled(getters.selectedPublicTreeData),
        })),
        // private
        privateDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(state.privateFolderList, state.privateDashboardList, state.newIdList)),
        selectedPrivateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getSelectedTreeData(getters.privateDashboardTreeData, state.selectedPrivateIdMap)),
        privateModalTableItems: computed<DashboardDataTableItem[]>(() => convertTreeDataToDataTableItems(getters.privateDashboardTreeData, getters.selectedPrivateTreeData)),
        privateTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPrivateTreeData.length === 0,
            move: getters.selectedPrivateTreeData.length === 0,
            delete: getters.selectedPrivateTreeData.length === 0,
        })),
        //
        existingFolderNameList: computed<string[]>(() => {
            const _publicNames = state.publicFolderList.map((d) => d.name);
            const _privateNames = state.privateFolderList.map((d) => d.name);
            return [..._publicNames, ..._privateNames];
        }),
        existingDashboardNameList: computed<string[]>(() => {
            const _publicNames = state.publicDashboardList.map((d) => d.name);
            const _privateNames = state.privateDashboardList.map((d) => d.name);
            return [..._publicNames, ..._privateNames];
        }),
    });

    /* Mutations */
    const setLoading = (loading: boolean) => { state.loading = loading; };
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
    const setFolderCloneModalVisible = (visible: boolean) => {
        state.folderCloneModalVisible = visible;
    };
    const setSelectedPublicIdMap = (idMap: Record<string, boolean>) => {
        state.selectedPublicIdMap = idMap;
    };
    const setSelectedPrivateIdMap = (idMap: Record<string, boolean>) => {
        state.selectedPrivateIdMap = idMap;
    };
    const setFolderModalType = (type: 'PUBLIC' | 'PRIVATE') => {
        state.folderModalType = type;
    };
    const setNewIdList = (newIdList: string[]) => {
        state.newIdList = newIdList;
    };
    const setFolderShareModalVisible = (visible: boolean) => {
        state.folderShareModalVisible = visible;
    };
    const setSearchQueryTags = (queryTags: QueryTag[] = []) => {
        state.searchQueryTags = queryTags;
    };
    const setSearchFilters = (filters: ConsoleFilter[]) => { state.searchFilters = filters; };
    const mutations = {
        setLoading,
        setFolderFormModalVisible,
        setFolderFormModalType,
        setSelectedFolderId,
        setFolderDeleteModalVisible,
        setFolderMoveModalVisible,
        setSelectedPublicIdMap,
        setSelectedPrivateIdMap,
        setFolderModalType,
        setFolderCloneModalVisible,
        setNewIdList,
        setFolderShareModalVisible,
        setSearchQueryTags,
        setSearchFilters,
    };

    /* Actions */
    const reset = () => {
        setLoading(false);
        setFolderFormModalVisible(false);
        setFolderFormModalType('CREATE');
        setSelectedFolderId(undefined);
        setFolderDeleteModalVisible(false);
        setFolderMoveModalVisible(false);
        setFolderModalType('PUBLIC');
        setFolderCloneModalVisible(false);
        setFolderShareModalVisible(false);
    };
    const resetSelectedIdMap = (type?: 'PUBLIC'|'PRIVATE') => {
        if (type === 'PUBLIC') {
            setSelectedPublicIdMap({});
        } else if (type === 'PRIVATE') {
            setSelectedPrivateIdMap({});
        } else {
            setSelectedPublicIdMap({});
            setSelectedPrivateIdMap({});
        }
    };
    const setSelectedIdMap = (idMap: Record<string, boolean>, type: 'PUBLIC'|'PRIVATE') => {
        if (type === 'PUBLIC') {
            setSelectedPublicIdMap(idMap);
        } else {
            setSelectedPrivateIdMap(idMap);
        }
    };
    const dashboardApiQueryHelper = new ApiQueryHelper();
    const fetchDashboard = async (dashboardType: 'PUBLIC'|'PRIVATE') => {
        const fetcher = dashboardType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateDashboard.list
            : SpaceConnector.clientV2.dashboard.publicDashboard.list;
        try {
            dashboardApiQueryHelper.setFilters(state.searchFilters);
            dashboardApiQueryHelper.addFilter({ k: 'version', v: '2.0', o: '=' });
            if (dashboardType === 'PUBLIC') {
                if (storeState.isAdminMode) {
                    dashboardApiQueryHelper.addFilter({ k: 'resource_group', v: 'DOMAIN', o: '=' });
                } else {
                    dashboardApiQueryHelper.addFilter({ k: 'resource_group', v: ['WORKSPACE', 'DOMAIN'], o: '=' });
                }
            }
            const response = await fetcher({
                query: {
                    ...dashboardApiQueryHelper.data,
                    sort: [{ key: 'created_at', desc: true }],
                },
            });
            const results = response.results || [];
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardList = results as PrivateDashboardModel[];
            } else {
                state.publicDashboardList = results as PublicDashboardModel[];
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            if (dashboardType === 'PRIVATE') {
                state.privateDashboardList = [];
            } else {
                state.publicDashboardList = [];
            }
        }
    };
    const fetchFolder = async (folderType: 'PUBLIC'|'PRIVATE') => {
        const fetcher = folderType === 'PRIVATE'
            ? SpaceConnector.clientV2.dashboard.privateFolder.list
            : SpaceConnector.clientV2.dashboard.publicFolder.list;
        try {
            const res: ListResponse<FolderModel> = await fetcher({
                query: {
                    sort: [{ key: 'created_at', desc: true }],
                },
            });
            const results = res.results || [];
            if (folderType === 'PRIVATE') {
                state.privateFolderList = results as PrivateFolderModel[];
            } else {
                state.publicFolderList = results as PublicFolderModel[];
            }
        } catch (e) {
            ErrorHandler.handleError(e);
            if (folderType === 'PRIVATE') {
                state.privateFolderList = [];
            } else {
                state.publicFolderList = [];
            }
        }
    };
    const load = async () => {
        state.loading = true;
        await Promise.allSettled([
            fetchDashboard('PUBLIC'),
            fetchDashboard('PRIVATE'),
            fetchFolder('PUBLIC'),
            fetchFolder('PRIVATE'),
        ]);
        state.loading = false;
    };
    const actions = {
        reset,
        resetSelectedIdMap,
        setSelectedIdMap,
        load,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
