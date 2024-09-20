import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { PrivateDashboardModel } from '@/schema/dashboard/private-dashboard/model';
import type { PrivateFolderModel } from '@/schema/dashboard/private-folder/model';
import type { PublicDashboardModel } from '@/schema/dashboard/public-dashboard/model';
import type { PublicFolderModel } from '@/schema/dashboard/public-folder/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import type { DashboardTreeDataType } from '@/services/dashboards/types/dashboard-folder-type';


type DashboardModel = PublicDashboardModel | PrivateDashboardModel;
type FolderModel = PublicFolderModel | PrivateFolderModel;
interface DataTableItem {
    id: string;
    name: string;
    location?: string;
    type: 'DASHBOARD' | 'FOLDER';
    isFolderSelected?: boolean;
}
const _getDashboardTreeData = (folderList: FolderModel[], dashboardList: DashboardModel[]): TreeNode<DashboardTreeDataType>[] => {
    const nodes: Record<string, TreeNode<DashboardTreeDataType>> = {};
    folderList.forEach((d) => {
        nodes[d.folder_id] = {
            id: d.folder_id,
            depth: 0,
            data: {
                name: d.name,
                type: 'FOLDER',
                id: d.folder_id,
            },
            children: [],
        };
    });
    dashboardList.forEach((d) => {
        nodes[d.dashboard_id] = {
            id: d.dashboard_id,
            depth: 0,
            data: {
                name: d.name,
                id: d.dashboard_id,
                type: 'DASHBOARD',
                folderId: d.folder_id,
                shared: d?.shared,
                scope: d?.scope,
                userId: d?.user_id,
                createdBy: d.tags?.created_by,
            },
        };
    });

    const rootNodes: TreeNode<DashboardTreeDataType>[] = [];
    const setDepth = (node, depth) => {
        node.depth = depth;
        if (!node.children) return;
        node.children.forEach((child) => {
            setDepth(child, depth + 1);
        });
    };
    Object.values(nodes).forEach((node) => {
        const folderId = node.data?.folderId;
        if (!folderId) {
            rootNodes.push(node);
            setDepth(node, 0);
        } else {
            const parentNode = nodes[folderId];
            if (parentNode) {
                parentNode.children = parentNode.children || [];
                parentNode.children.push(node);
                setDepth(node, parentNode.depth + 1);
            }
        }
    });

    return rootNodes;
};
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
export const useDashboardMainPageStore = defineStore('page-dashboard-main', () => {
    const dashboardStore = useDashboardStore();
    const dashboardState = dashboardStore.state;
    const storeState = reactive({
        isWorkspaceOwner: computed(() => store.getters['user/getCurrentRoleInfo']?.roleType === ROLE_TYPE.WORKSPACE_OWNER),
    });
    const state = reactive({
        folderFormModalVisible: false,
        folderFormModalType: 'CREATE' as 'CREATE' | 'UPDATE',
        folderMoveModalType: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
        folderDeleteModalVisible: false,
        folderMoveModalVisible: false,
        folderCloneModalVisible: false,
        selectedFolderId: undefined as string | undefined,
        selectedIdMap: {} as Record<string, boolean>,
    });
    const getters = reactive({
        publicDashboardItems: computed<PublicDashboardModel[]>(() => {
            if (!storeState.isWorkspaceOwner) return [];
            return dashboardState.publicDashboardItems
                .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
                .filter((item) => !(item.resource_group === 'DOMAIN' && item.scope === 'PROJECT'))
                .filter((d) => d.version === '2.0')
                || [];
        }),
        publicFolderItems: computed<PublicFolderModel[]>(() => {
            if (!storeState.isWorkspaceOwner) return [];
            return dashboardState.publicFolderItems
                .filter((item) => ['WORKSPACE', 'DOMAIN'].includes(item.resource_group))
                .filter((item) => !(item.resource_group === 'DOMAIN' && item.project_id.length > 1))
                || [];
        }),
        publicDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => _getDashboardTreeData(getters.publicFolderItems, getters.publicDashboardItems)),
        privateDashboardItems: computed<PrivateDashboardModel[]>(() => dashboardState.privateDashboardItems),
        privateFolderItems: computed<PrivateFolderModel[]>(() => dashboardState.privateFolderItems),
        privateDashboardTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => _getDashboardTreeData(getters.privateFolderItems, getters.privateDashboardItems)),
        selectedTreeData: computed<TreeNode<DashboardTreeDataType>[]>(() => {
            const _treeData: TreeNode<DashboardTreeDataType>[] = [...getters.publicDashboardTreeData, ...getters.privateDashboardTreeData];
            return _getSelectedTreeData(_treeData, state.selectedIdMap);
        }),
        modalTableItems: computed<DataTableItem[]>(() => {
            const _treeData = [...getters.publicDashboardTreeData, ...getters.privateDashboardTreeData];
            const _tableItems: DataTableItem[] = [];
            getters.selectedTreeData.forEach((node) => {
                if (node.data.type === 'FOLDER') {
                    _tableItems.push({
                        id: node.data.id,
                        name: node.data.name,
                        type: 'FOLDER',
                    });
                    node.children?.forEach((child) => {
                        _tableItems.push({
                            id: child.data.id,
                            name: child.data.name,
                            location: node.data.name,
                            type: 'DASHBOARD',
                            isFolderSelected: true,
                        });
                    });
                } else {
                    const _folderId = node.data?.folderId;
                    const _folderName = _treeData.find((d) => d.id === _folderId)?.data?.name;
                    _tableItems.push({
                        id: node.data.id,
                        name: node.data.name,
                        location: _folderName,
                        type: 'DASHBOARD',
                    });
                }
            });
            return _tableItems;
        }),
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
    const setSelectedIdMap = (idMap: Record<string, boolean>) => {
        state.selectedIdMap = idMap;
    };
    const setFolderMoveModalType = (type: 'PUBLIC' | 'PRIVATE') => {
        state.folderMoveModalType = type;
    };
    const mutations = {
        setFolderFormModalVisible,
        setFolderFormModalType,
        setSelectedFolderId,
        setFolderDeleteModalVisible,
        setFolderMoveModalVisible,
        setSelectedIdMap,
        setFolderMoveModalType,
        setFolderCloneModalVisible,
    };

    /* Actions */
    const reset = () => {
        setFolderFormModalVisible(false);
        setFolderFormModalType('CREATE');
        setSelectedFolderId(undefined);
        setFolderDeleteModalVisible(false);
        setFolderMoveModalVisible(false);
        setFolderMoveModalType('PUBLIC');
        setFolderCloneModalVisible(false);
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
