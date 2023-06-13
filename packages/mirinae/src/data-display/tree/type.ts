import type { CloneTreeDataOptions, WalkTreeDataCallback, Node } from '@/data-display/tree/he-tree-vue/types';

export interface TreeNode<T=any> extends Node {
    data: T;
    loading: boolean;
    children: TreeNode<T>[];
}

export interface TreeItem<T=any> {
    path: number[];
    node: TreeNode<T>;
}

export interface Predicate<T=any> {
    (data: T): boolean;
}

export interface ToggleOptions<T=any> {
    disabled?: boolean;
    validator?: (node: TreeNode<T>) => boolean;
    toggleOnNodeClick?: boolean;
    removeChildrenOnFold?: boolean;
}

export interface SelectOptions<T=any> {
    disabled?: boolean;
    validator?: (node: TreeNode<T>) => boolean;
    multiSelectable?: boolean;
}

export interface EditOptions<T=any> {
    disabled?: boolean;
    validator?: (editText: string) => boolean;
    editStartValidator?: (node: TreeNode<T>) => boolean;
    setDataAfterEdit?: boolean;
}

export interface DragOptions {
    disabled?: boolean;
    startValidator?: (node?: TreeNode, dragNodeParent?: null|TreeNode) => boolean;
    dragValidator?: (node?: TreeNode, dragNodeParent?: null|TreeNode) => boolean;
    dropValidator?: (node?: TreeNode, oldParent?: null|TreeNode, parent?: null|TreeNode) => boolean;
    endValidator?: (node?: TreeNode, oldParent?: null|TreeNode, parent?: null|TreeNode) => boolean;
}

export interface DataGetter<T=any> {
    (node: TreeNode<T>): T;
}

export interface DataSetter<T=any> {
    (editText: string, node: TreeNode<T>): void;
}

export interface DataFetcher<T=any> {
    (node: Partial<TreeNode<T>>): Promise<T[]>|T[];
}

export interface GetClassNames<T=any> {
    (node: TreeNode<T>): Record<string, boolean>;
}


// TODO: this need to be applied to console or rollback to the previous name
export interface TreeType<T=any> {
    fetchData: (node?: TreeNode<T>|null) => Promise<TreeNode<T>[]>;
    changeSelectState: (node: TreeNode<T>, path: number[], value?: boolean) => void;
    addNode: (data: T[]|T) => void;
    findNode: (predicate: Predicate<T>) => TreeNode<T>|null;
    fetchAndFindNode: (predicates: Predicate<T>[]) => Promise<{node: TreeNode<T>|null; path: number[]}>;
    fetchAndFindNodes: (predicateList: Predicate<T>[][]) => Promise<{node: TreeNode<T>; path: number[]}[]>;
    resetSelect: () => void;
    getAllNodes: (node?: TreeNode<T>|null) => TreeNode<T>[];
    getAllItems: (node?: TreeNode<T>|null) => TreeItem<T>[];
    deleteNodeByPath: (path: number[]) => void;
    deleteNode: (predicate: Predicate<T>) => void;
    addChildNodeByPath: (path: number[], data: T[]|T, unfold?: boolean) => void;
    updateNodeByPath: (path: number[], data: T) => void;
    updateNode: (predicate: Predicate<T>, data: T) => void;
    toggleNode: (node: TreeNode<T>, path: number[]) => void;
    // he tree vue api
    getNodeParentByPath: (path: number[]) => TreeNode<T>|null;
    getNodeByPath: (path: number[]) => TreeNode<T>;
    walkTreeData: (treeData: TreeNode<T>[]|null, handler: WalkTreeDataCallback, options?: {reverse: boolean}) => void;
    cloneTreeData(treeData: TreeNode<T>[]|null, options?: CloneTreeDataOptions): TreeNode[];
    fold(node: TreeNode<T>): void;
    unfold(node: TreeNode<T>): void;
}
