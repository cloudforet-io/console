import type { TreeNode } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/schema/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/schema/dashboard/_types/folder-type';

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


export const convertTreeDataToDataTableItems = (treeData: TreeNode<DashboardTreeDataType>[], selectedTreeData: TreeNode<DashboardTreeDataType>[]): DashboardDataTableItem[] => {
    const _tableItems: DashboardDataTableItem[] = [];
    selectedTreeData.forEach((node) => {
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
            const _folderName = treeData.find((d) => d.id === _folderId)?.data?.name;
            _tableItems.push({
                id: node.data.id,
                name: node.data.name,
                location: _folderName,
                type: 'DASHBOARD',
            });
        }
    });
    return _tableItems;
};
