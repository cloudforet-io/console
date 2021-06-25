import { Node } from 'he-tree-vue';

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
}

export interface DragOptions {
    disabled?: boolean;
    dragValidator?: (node?: TreeNode, parent?: null|TreeNode) => boolean;
    dropValidator?: (node?: TreeNode, parent?: null|TreeNode) => boolean;
    startValidator?: (node?: TreeNode, parent?: null|TreeNode) => boolean;
    endValidator?: (node?: TreeNode, parent?: null|TreeNode) => boolean;
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


export interface Tree<T=any> {
    fetchData: (node?: TreeNode<T>|null) => Promise<TreeNode<T>[]>;
    changeSelectState: (node: TreeNode<T>, path: number[], value?: boolean) => void;
    addNode: (data: T[]|T) => void;
    findNode: (predicate: Predicate<T>) => TreeNode<T>|null;
    fetchAndFindNode: (predicates: Predicate<T>[]) => Promise<{node: TreeNode<T>|null; path: number[]}>;
    fetchAndFindNodes: (predicateList: Predicate<T>[][]) => Promise<{node: TreeNode<T>; path: number[]}[]>;
    resetSelect: () => void;
    getAllNodes: (node?: TreeNode<T>|null, nodes?: TreeNode<T>[]) => TreeNode<T>[];
    getAllItems: (node?: TreeNode<T>|null, path?: number[]) => TreeItem<T>[];
    deleteNodeByPath: (path: number[]) => void;
    deleteNode: (predicate: Predicate<T>) => void;
    addChildNodeByPath: (path: number[], data: T[]|T, unfold?: boolean) => void;
    updateNodeByPath: (path: number[], data: T) => void;
    updateNode: (predicate: Predicate<T>, data: T) => void;
    toggleNode: (node: TreeNode<T>, path: number[]) => void;
    // he tree vue api
    getNodeParentByPath: (path: number[]) => TreeNode<T>|null;
    getNodeByPath: (path: number[]) => TreeNode<T>;
}
