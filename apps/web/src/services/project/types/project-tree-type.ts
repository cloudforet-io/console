import type { TreeItem, Tree } from '@spaceone/design-system/types/data-display/tree/type';


export type ProjectTreeItemType = 'PROJECT_GROUP'|'PROJECT';

export interface ProjectTreeNodeData {
    id: string;
    name: string;
    item_type: ProjectTreeItemType;
    has_child?: boolean|null;
    has_permission?: boolean|null;
}

export interface ProjectGroupTreeNodeData {
    id: string;
    name: string;
}

export type ProjectTreeItem = TreeItem<ProjectTreeNodeData>;

export type ProjectTreeRoot = Tree<ProjectTreeNodeData>;

export type ProjectGroupTreeItem = Partial<ProjectTreeItem>;
