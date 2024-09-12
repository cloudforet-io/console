import type { TreeData } from '@cloudforet/mirinae/src/data-display/tree/tree-view/type';


export interface DashboardTreeDataType extends TreeData {
    name: string;
    type: 'FOLDER'| 'DASHBOARD';
    id: string;
    folderId?: string;
    shared?: boolean;
    scope?: string;
    userId?: string;
    createdBy?: string;
}
