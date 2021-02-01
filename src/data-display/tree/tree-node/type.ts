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

type ClassNamesType<T=any> = (node: TreeItem<T>) => {[name: string]: boolean};

export interface TreeNodeProps<T=any> {
    level?: number;
    padSize?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNamesType<T>;
    data?: T;
    children?: TreeNode<T>[] | boolean;
    state?: TreeNodeState;
}
