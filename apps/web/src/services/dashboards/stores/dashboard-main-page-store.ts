import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import {
    convertTreeDataToDataTableItems,
    getDashboardTreeData,
} from '@/services/dashboards/helpers/dashboard-tree-data-helper';
import type { DashboardTreeDataType, DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';


const _getSelectedTreeData = (dashboardTreeData: TreeNode<DashboardTreeDataType>[], selectedIdMap: Record<string, boolean>): TreeNode<DashboardTreeDataType>[] => {
    const _selectedIdList = Object.keys(selectedIdMap).filter((key) => selectedIdMap[key]);
    const _selectedNodeList: TreeNode<DashboardTreeDataType>[] = [];
    _selectedIdList.forEach((id) => {
        const _node = dashboardTreeData.find((node) => node.data.id === id);
        if (!_node) return;
        if (_node?.data.type === 'FOLDER') {
            const _childrenDashboards = _node.children?.filter((child) => selectedIdMap[child.id]);
            // get folder id only if all children are selected
            if (_childrenDashboards?.length === _node.children?.length) {
                _selectedNodeList.push(_node);
            } else if (_childrenDashboards) {
                _selectedNodeList.push(..._childrenDashboards);
            }
        } else {
            _selectedNodeList.push(_node);
        }
    });
    return _selectedNodeList;
};
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
    const dashboardStore = useDashboardStore();
    const dashboardState = dashboardStore.state;
    const storeState = reactive({
        isAdminMode: computed(() => appContextStore.getters.isAdminMode),
        isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
    const state = reactive({
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
    });
    const getters = reactive({
        // admin
        adminTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPublicTreeData.length === 0,
            move: getters.selectedPublicTreeData.length === 0,
            delete: getters.selectedPublicTreeData.length === 0,
        })),
        // public
        publicDashboardItems: computed<PublicDashboardModel[]>(() => {
            if (storeState.isAdminMode) {
                return dashboardState.publicDashboardItems
                    .filter((item) => item.resource_group === 'DOMAIN')
                    || [];
            }
            if (storeState.isWorkspaceOwner) {
                return dashboardState.publicDashboardItems
                    .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
                    .filter((item) => !(item.resource_group === 'DOMAIN' && item.project_id === '*'))
                    .filter((d) => d.version === '2.0')
                    || [];
            }
            return [];
        }),
        publicFolderItems: computed<PublicFolderModel[]>(() => {
            if (storeState.isAdminMode) {
                return dashboardState.publicFolderItems
                    .filter((item) => item.resource_group === 'DOMAIN')
                    || [];
            }
            if (storeState.isWorkspaceOwner) {
                return dashboardState.publicFolderItems
                    .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
                    .filter((item) => !(item.resource_group === 'DOMAIN' && item.project_id === '*')) // excluded shared to project
                    || [];
            }
            return [];
        }),
        publicDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(getters.publicFolderItems, getters.publicDashboardItems, state.newIdList)),
        selectedPublicTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => _getSelectedTreeData(getters.publicDashboardTreeData, state.selectedPublicIdMap)),
        publicModalTableItems: computed<DashboardDataTableItem[]>(() => convertTreeDataToDataTableItems(getters.publicDashboardTreeData, getters.selectedPublicTreeData)),
        publicTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPublicTreeData.length === 0,
            move: _isControlButtonDisabled(getters.selectedPublicTreeData),
            delete: _isControlButtonDisabled(getters.selectedPublicTreeData),
        })),
        // private
        privateDashboardItems: computed<PrivateDashboardModel[]>(() => dashboardState.privateDashboardItems),
        privateFolderItems: computed<PrivateFolderModel[]>(() => dashboardState.privateFolderItems),
        privateDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => getDashboardTreeData(getters.privateFolderItems, getters.privateDashboardItems, state.newIdList)),
        selectedPrivateTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => _getSelectedTreeData(getters.privateDashboardTreeData, state.selectedPrivateIdMap)),
        privateModalTableItems: computed<DashboardDataTableItem[]>(() => convertTreeDataToDataTableItems(getters.privateDashboardTreeData, getters.selectedPrivateTreeData)),
        privateTreeControlButtonDisableMap: computed<Record<string, boolean>>(() => ({
            clone: getters.selectedPrivateTreeData.length === 0,
            move: getters.selectedPrivateTreeData.length === 0,
            delete: getters.selectedPrivateTreeData.length === 0,
        })),
        //
        existingFolderNameList: computed<string[]>(() => {
            const _publicNames = dashboardState.publicFolderItems.map((d) => d.name);
            const _privateNames = dashboardState.privateFolderItems.map((d) => d.name);
            return [..._publicNames, ..._privateNames];
        }),
        existingDashboardNameList: computed<string[]>(() => {
            const _publicNames = dashboardState.publicDashboardItems.map((d) => d.name);
            const _privateNames = dashboardState.privateDashboardItems.map((d) => d.name);
            return [..._publicNames, ..._privateNames];
        }),
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
    const mutations = {
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
    };

    /* Actions */
    const reset = () => {
        setFolderFormModalVisible(false);
        setFolderFormModalType('CREATE');
        setSelectedFolderId(undefined);
        setFolderDeleteModalVisible(false);
        setFolderMoveModalVisible(false);
        setFolderModalType('PUBLIC');
        setFolderCloneModalVisible(false);
        setFolderShareModalVisible(false);
    };
    const resetSelectedIdMap = (type: 'PUBLIC'|'PRIVATE') => {
        if (type === 'PUBLIC') {
            setSelectedPublicIdMap({});
        } else {
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
    const actions = {
        reset,
        resetSelectedIdMap,
        setSelectedIdMap,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
