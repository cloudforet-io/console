import { ProjectItemResp, ProjectTreeItem } from '@/views/project/project/type';
import { RootTreeNode } from '@spaceone/design-system/dist/src/data-display/tree/type';

export interface ProjectPageState {
    searchText?: string;

    rootNode?: RootTreeNode<ProjectItemResp>|null;
    selectedNode?: ProjectTreeItem|null;
    treeEditMode: boolean;

    hasProjectGroup?: boolean;
    projectCount?: number;

    actionTargetNode?: ProjectTreeItem|null;
    projectGroupFormVisible: boolean;
    projectGroupFormUpdateMode: boolean;
    projectGroupDeleteCheckModalVisible: boolean;
    projectFormVisible: boolean;
}
