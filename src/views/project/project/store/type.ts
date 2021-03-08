import { ProjectGroupTreeItem } from '@/views/project/project/type';

export interface ProjectPageState {
    isInitiated: boolean;

    searchText?: string;

    rootNode?: any|null;
    selectedItem: ProjectGroupTreeItem;
    treeEditMode: boolean;

    hasProjectGroup?: boolean;
    projectCount?: number;

    actionTargetItem: ProjectGroupTreeItem;
    projectGroupFormVisible: boolean;
    projectGroupFormUpdateMode: boolean;
    projectGroupDeleteCheckModalVisible: boolean;
    projectFormVisible: boolean;
}
