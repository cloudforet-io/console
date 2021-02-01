import { TreeItem, TreeNode, TreeNodeState } from '@/data-display/tree/tree-node/type';

export interface Tree<T=any> {
    nodes: TreeNode<T>[];
    selectedNodes: TreeItem<T>[];
    firstSelectedNode?: TreeItem<T>;
    applyState(item: TreeItem<T>): void;
    setNodeState(item: TreeItem<T>, state: TreeNodeState): void;
    deleteNode(item: TreeItem<T>): void;
    setSelectedNodes(item: TreeItem<T>): void;
}
