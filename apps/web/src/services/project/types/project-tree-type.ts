import type { TreeNode } from '@spaceone/design-system/src/data-display/tree/type';
import type { TreeItem, Tree } from '@spaceone/design-system/types/data-display/tree/type';


export type ProjectTreeItemType = 'PROJECT_GROUP'|'PROJECT'|'ROOT';

export interface ProjectTreeNodeData {
    id: string;
    name: string;
    item_type: ProjectTreeItemType;
    has_child?: boolean|null;
}

export interface ProjectGroupTreeNodeData {
    id: string;
    name: string;
}

export type ProjectTreeItem = TreeItem<ProjectTreeNodeData>;

export type ProjectTreeRoot = Tree<ProjectTreeNodeData>;

export type ProjectGroupTreeItem = Partial<ProjectTreeItem>;

export type ProjectTreeNode = TreeNode<ProjectTreeNodeData>;
