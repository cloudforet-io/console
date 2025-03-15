import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';

import type { DashboardTreeDataType, DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';


export const getDashboardTreeData = (folderList: FolderModel[], dashboardList: DashboardModel[], newIdList?: string[]): TreeNode<DashboardTreeDataType>[] => {
    const nodes: Record<string, TreeNode<DashboardTreeDataType>> = {};
    folderList.forEach((d) => {
        nodes[d.folder_id] = {
            id: d.folder_id,
            depth: 0,
            data: {
                name: d.name,
                type: 'FOLDER',
                id: d.folder_id,
                shared: d?.shared,
                scope: d?.scope,
                projectId: d?.project_id,
                workspaceId: d?.workspace_id,
                createdBy: d.tags?.created_by,
                isNew: newIdList?.includes(d.folder_id),
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
                projectId: d?.project_id,
                workspaceId: d?.workspace_id,
                userId: d?.user_id,
                createdBy: d.tags?.created_by,
                isNew: newIdList?.includes(d.dashboard_id),
                labels: d?.labels,
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

export const getSelectedDataTableItems = (folderItems: FolderModel[], dashboardItems: DashboardModel[], selectedIdMap: Record<string, boolean>): DashboardDataTableItem[] => {
    const _results: DashboardDataTableItem[] = [];
    const _selectedIdList: string[] = Object.keys(selectedIdMap).filter((key) => selectedIdMap[key]);
    const _selectedFolderIdList: string[] = _selectedIdList.filter((id) => id.includes('folder'));
    const _selectedDashboardIdList: string[] = _selectedIdList.filter((id) => id.includes('dash'));

    // 1. Add selected folders and its children dashboards
    _selectedFolderIdList.forEach((id) => {
        const _targetFolder = folderItems.find((f) => f.folder_id === id);
        const _childrenDashboards = dashboardItems.filter((d) => d.folder_id === id);
        const _isAllChildrenSelected = _childrenDashboards.map((d) => d.dashboard_id).every((childId) => selectedIdMap[childId]);
        if (!_targetFolder || !_isAllChildrenSelected) return;
        _results.push({
            id,
            name: _targetFolder?.name,
            type: 'FOLDER',
        });
        _childrenDashboards.forEach((child) => {
            _results.push({
                id: child.dashboard_id,
                name: child.name,
                location: _targetFolder.name,
                type: 'DASHBOARD',
                folderId: id,
                isFolderSelected: true,
            });
        });
    });

    // 2. Add selected dashboards
    _selectedDashboardIdList.forEach((id) => {
        if (_results.find((r) => r.id === id)) return; // skip if already added
        const _targetDashboard = dashboardItems.find((d) => d.dashboard_id === id);
        const _parentFolder = folderItems.find((f) => f.folder_id === _targetDashboard?.folder_id);
        if (!_targetDashboard) return;
        _results.push({
            id: _targetDashboard.dashboard_id,
            name: _targetDashboard.name,
            location: _parentFolder?.name,
            type: 'DASHBOARD',
            folderId: _parentFolder?.folder_id,
            isFolderSelected: false,
        });
    });

    return _results;
};

export const isPublicControlButtonDisabled = (dashboardItems: DashboardModel[], selectedIdMap: Record<string, boolean>): boolean => {
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
