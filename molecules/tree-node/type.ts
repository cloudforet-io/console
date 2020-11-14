import { TreeItem, TreeNode } from '@/components/molecules/tree-node/PTreeNode.toolset';

export interface Tree {
    nodes: TreeNode[];
    selectedNodes: TreeItem[];
    firstSelectedNode?: TreeItem;
    applyState(TreeItem): void;
    setNodeState(item: TreeItem, state: {[name: string]: boolean}): void;
    deleteNode(item: TreeItem): void;
    setSelectedNodes(item: TreeItem): void;
}
