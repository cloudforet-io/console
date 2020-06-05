import { TreeNodeProps } from '@/components/molecules/tree/PTreeNode.toolset';

export const treeProps = {
    data: {
        type: Object,
        default: () => ({}),
    },
};

export interface TreeNode {
    level: number; // by data
    classNames?: string[]; // by developer
    disabled?: boolean; // by data ?
    selected?: boolean; // by user
    hasChild?: boolean; // by data
    expanded?: boolean; // by user
    padSize: string; // by developer
    children: TreeNode; // by data
}


export interface TreeProps {
    data: TreeNode;
}
