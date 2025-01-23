import { computed, reactive } from 'vue';

import { sortBy } from 'lodash';
import { defineStore } from 'pinia';

import type { QueryTag } from '@cloudforet/mirinae/src/controls/search/query-search-tags/type';
import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';
import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useUserStore } from '@/store/user/user-store';

import {
    getDashboardTreeData,
} from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';



const _isPublicControlButtonDisabled = (dashboardItems: DashboardModel[], selectedIdMap: Record<string, boolean>): boolean => {
    const _selectedIdList: string[] = Object.entries(selectedIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
    if (_selectedIdList.length === 0) return true;
    let result = false;
    _selectedIdList.forEach((id) => {
        if (result) return;
        const _isFolder = id.includes('folder');
        if (_isFolder) {
            const _childrenDashboards = dashboardItems.filter((d) => d.folder_id === id);
            _childrenDashboards?.forEach((child) => {
                if (child?.shared && child?.scope === 'WORKSPACE') {
                    result = true;
                }
            });
        } else {
            const _dashboard = dashboardItems.find((d) => d.dashboard_id === id);
            if (_dashboard?.shared && _dashboard?.scope === 'WORKSPACE') {
                result = true;
            }
        }
    });
    return result;
};

export const useDashboardPageControlStore = defineStore('page-dashboard-control', () => {
    const appContextStore = useAppContextStore();
    const dashboardStore = useDashboardStore();
    const dashboardState = dashboardStore.state;
    const userStore = useUserStore();
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed(() => userStore.state.currentRoleInfo?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
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
        //
        selectedPublicIdMap: {} as Record<string, boolean>,
        selectedPrivateIdMap: {} as Record<string, boolean>,
        newIdList: [] as string[],
        searchQueryTags: [] as QueryTag[],
    });
    const getters = reactive({
        // admin
        adminTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
            const _selectedPublicIdList: string[] = Object.entries(state.selectedPublicIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
            return {
                clone: _selectedPublicIdList.length === 0,
                move: _selectedPublicIdList.length === 0,
                delete: _selectedPublicIdList.length === 0,
            };
        }),
        // public (only for dashboard page, so project dashboards are excluded)
        publicDashboardItems: computed<PublicDashboardModel[]>(() => {
            const _v2DashboardItems = dashboardState.publicDashboardItems.filter((d) => d.version !== '1.0');
            const _sortedV2DashboardItems = sortBy(_v2DashboardItems, 'name');
            if (storeState.isAdminMode) return _sortedV2DashboardItems;
            return _sortedV2DashboardItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
        }),
        publicFolderItems: computed<PublicFolderModel[]>(() => {
            const sortedFolderItems = sortBy(dashboardState.publicFolderItems, 'name');
            if (storeState.isAdminMode) return sortedFolderItems;
            return sortedFolderItems.filter((d) => !(d.resource_group === 'DOMAIN' && !!d.shared && d.scope === 'PROJECT'));
        }),
        publicDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(getters.publicFolderItems, getters.publicDashboardItems, state.newIdList)),
        publicTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
            const _selectedPublicIdList: string[] = Object.entries(state.selectedPublicIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
            return {
                clone: _selectedPublicIdList.length === 0,
                move: _isPublicControlButtonDisabled(getters.publicDashboardItems, state.selectedPublicIdMap),
                delete: _isPublicControlButtonDisabled(getters.publicDashboardItems, state.selectedPublicIdMap),
            };
        }),
        // private
        privateDashboardItems: computed<PrivateDashboardModel[]>(() => {
            const _v2DashboardItems = dashboardState.privateDashboardItems.filter((d) => d.version !== '1.0');
            const _sortedV2DashboardItems = sortBy(_v2DashboardItems, 'name');
            return _sortedV2DashboardItems;
        }),
        privateFolderItems: computed<PrivateFolderModel[]>(() => sortBy(dashboardState.privateFolderItems, 'name')),
        privateDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(getters.privateFolderItems, getters.privateDashboardItems, state.newIdList)),
        privateTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => {
            const _selectedPrivateIdList: string[] = Object.entries(state.selectedPrivateIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
            return {
                clone: _selectedPrivateIdList.length === 0,
                move: _selectedPrivateIdList.length === 0,
                delete: _selectedPrivateIdList.length === 0,
            };
        }),
        // deprecated (version 1.0)
        deprecatedDashboardItems: computed<Array<PublicDashboardModel|PrivateDashboardModel>>(() => {
            const _publicDeprecated = dashboardState.publicDashboardItems.filter((d) => d.version === '1.0');
            const _privateDeprecated = dashboardState.privateDashboardItems.filter((d) => d.version === '1.0');
            return [..._publicDeprecated, ..._privateDeprecated];
        }),
        // etc
        allDashboardItems: computed<DashboardModel[]>(() => [...getters.publicDashboardItems, ...getters.privateDashboardItems]),
        allFolderItems: computed<FolderModel[]>(() => [...getters.publicFolderItems, ...getters.privateFolderItems]),
        loading: computed<boolean>(() => dashboardState.loading),
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
    const setSearchQueryTags = (queryTags: QueryTag[] = []) => {
        state.searchQueryTags = queryTags;
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
        setSelectedPublicIdMap,
        setSelectedPrivateIdMap,
        setFolderModalType,
        setBundleCloneModalVisible,
        setNewIdList,
        setBundleShareModalVisible,
        setSearchQueryTags,
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
        state.selectedPublicIdMap = {};
        state.selectedPrivateIdMap = {};
    };
    const resetSelectedIdMap = (type?: 'PUBLIC'|'PRIVATE') => {
        if (type === 'PUBLIC') {
            state.selectedPublicIdMap = {};
        } else if (type === 'PRIVATE') {
            state.selectedPrivateIdMap = {};
        } else {
            state.selectedPublicIdMap = {};
            state.selectedPrivateIdMap = {};
        }
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
        resetSelectedIdMap,
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
        getters,
        ...mutations,
        ...actions,
    };
});
