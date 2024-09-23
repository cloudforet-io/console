import type { TreeData } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';


export interface DashboardTreeDataType extends TreeData {
    name: string;
    type: 'FOLDER'| 'DASHBOARD';
    id: string;
    folderId?: string;
    shared?: boolean;
    projectId?: string;
    workspaceId?: string;
    userId?: string;
    createdBy?: string;
    isNew?: boolean;
    labels?: string[];
}

export interface ModalDataTableItem {
    id: string;
    name: string;
    location?: string;
    type: 'DASHBOARD' | 'FOLDER';
    isFolderSelected?: boolean;
}
