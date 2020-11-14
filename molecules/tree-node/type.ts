
export interface TreeNodeState {
    expanded: boolean;
    selected: boolean;
    loading: boolean;
}

export interface TreeNode<T=any> {
    data: T;
    children: TreeNode<T>[] | boolean;
    state: TreeNodeState;
}
export interface TreeItem<T=any> {
    key: number;
    level: number;
    parent: TreeItem<T>|null;
    node: TreeNode<T>;
    el?: HTMLElement;
}
