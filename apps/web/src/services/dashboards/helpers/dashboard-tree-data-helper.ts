import type { TreeNode } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import type { PublicFolderModel } from '@/api-clients/dashboard/public-folder/schema/model';

import type { DashboardTreeDataType, DashboardDataTableItem } from '@/services/dashboards/types/dashboard-folder-type';


export const getDashboardTreeData = (
    folderList: FolderModel[],
    dashboardList: DashboardModel[],
    newIdList?: string[],
): TreeNode<DashboardTreeDataType>[] => {
    const folderNodeMap: Record<string, TreeNode<DashboardTreeDataType>> = {};
    const rootNodes: TreeNode<DashboardTreeDataType>[] = [];

    folderList.forEach((folder) => {
        const folderNode: TreeNode<DashboardTreeDataType> = {
            id: folder.folder_id,
            depth: 0,
            data: {
                id: folder.folder_id,
                type: 'FOLDER',
                createdBy: folder.tags?.created_by,
                isNew: newIdList?.includes(folder.folder_id),
                ...folder,
            },
            children: [],
        };
        folderNodeMap[folder.folder_id] = folderNode;
        rootNodes.push(folderNode);
    });

    dashboardList.forEach((dashboard) => {
        const dashboardNode: TreeNode<DashboardTreeDataType> = {
            id: dashboard.dashboard_id,
            depth: 0,
            data: {
                id: dashboard.dashboard_id,
                type: 'DASHBOARD',
                createdBy: dashboard.tags?.created_by,
                isNew: newIdList?.includes(dashboard.dashboard_id),
                ...dashboard,
            },
        };

        const folderNode = dashboard.folder_id ? folderNodeMap[dashboard.folder_id] : undefined;

        if (folderNode) {
            dashboardNode.depth = 1;
            if (Array.isArray(folderNode.children)) {
                folderNode.children.push(dashboardNode);
            } else {
                folderNode.children = [dashboardNode];
            }
        } else {
            rootNodes.push(dashboardNode);
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

export const isPublicControlButtonDisabled = (dashboardItems: DashboardModel[], folderItems: FolderModel[], selectedIdMap: Record<string, boolean>, isProject = false): boolean => {
    const _selectedIdList: string[] = Object.entries(selectedIdMap).filter(([, isSelected]) => isSelected).map(([id]) => id);
    if (_selectedIdList.length === 0) return true;
    let result = false;
    _selectedIdList.forEach((id) => {
        if (result) return;
        const _isFolder = id.includes('folder');
        if (_isFolder) {
            const _folder = folderItems.find((f) => f.folder_id === id) as PublicFolderModel;
            if (isProject) result = !!_folder?.shared;
            else if (_folder?.shared && _folder?.scope === 'WORKSPACE') {
                result = true;
            }
        } else {
            const _dashboard = dashboardItems.find((d) => d.dashboard_id === id) as PublicDashboardModel;
            if (isProject) result = !!_dashboard?.shared;
            else if (_dashboard?.shared && _dashboard?.scope === 'WORKSPACE') {
                result = true;
            }
        }
    });
    return result;
};
