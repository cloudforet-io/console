import type { TreeData } from '@cloudforet/mirinae/types/data-display/tree/tree-view/type';

import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { FolderModel } from '@/api-clients/dashboard/_types/folder-type';


export type DashboardTreeDataType = TreeDataDashboard | TreeDataFolder;


type TreeDataDashboard = TreeDataBase & DashboardModel & {
    type: 'DASHBOARD';
};
type TreeDataFolder = TreeDataBase & FolderModel & {
    type: 'FOLDER';
};
export interface TreeDataBase extends TreeData {
    name: string;
    type: 'FOLDER'| 'DASHBOARD';
    id: string;
    createdBy?: string;
    isNew?: boolean;
    labels?: string[];
}

export interface DashboardDataTableItem {
    id: string;
    name: string;
    location?: string; // folder name
    folderId?: string; // folder id
    type: 'DASHBOARD' | 'FOLDER';
    isFolderSelected?: boolean;
}
