import { ProjectGroupTreeItem, ProjectTreeRoot } from '@/views/project/project/type';

export interface ProjectPageState {
    isInitiated: boolean;

    searchText?: string;

    rootNode?: ProjectTreeRoot|null;
    selectedItem: ProjectGroupTreeItem;
    treeEditMode: boolean;
    permissionInfo: Record<string, boolean>;

    hasProjectGroup?: boolean;
    projectCount?: number;

    actionTargetItem: ProjectGroupTreeItem;
    projectGroupFormVisible: boolean;
    projectGroupFormUpdateMode: boolean;
    projectGroupDeleteCheckModalVisible: boolean;
    projectFormVisible: boolean;
}
