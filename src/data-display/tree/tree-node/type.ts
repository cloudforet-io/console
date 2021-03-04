export interface TreeNodeState {
    expanded?: boolean;
    selected?: boolean;
    loading?: boolean;
}

export interface TreeNode<T=any> extends TreeNodeState {
    _id: string|number;
    data: T;
    children?: TreeNode<T>[] | boolean;
}

export interface SelectOptions<T=any> {
    disabled?: boolean;
    validator?: (item: TreeNode<T>) => boolean;
}

export interface EditOptions<T=any> {
    disabled?: boolean;
    editStartValidator?: (item: TreeNode<T>) => boolean;
    validator?: (value: string) => boolean;
    invalidText?: string;
    dataSetter?: (editText: string, originData: T) => T;
    dataGetter?: (data: T) => string;
}

export interface DragOptions<T=any> {
    disabled?: boolean;
    dragValidator?: (node: TreeNode<T>) => boolean;
    dropValidator?: (node: TreeNode<T>) => boolean;
}

export interface TreeItem<T=any> extends TreeNode {
    index: number;
    level: number;
    parent: TreeItem<T>|null;
    el?: HTMLElement;
    getChildrenNodes: () => TreeItem<T>;
    deleteNode: () => void;
    addChild: (data: T) => Promise<TreeItem<T>>;
    startEdit: () => void;
    finishEdit: () => void;
    findChildNode: (id: string|number) => TreeItem<T>|null;
    setData: (data: T) => void;
    setChildren: (children: T[] | boolean) => Promise<TreeItem<T>[]>;
    addChildren: (children: T[]) => Promise<TreeItem<T>[]>;
    setSelected: (selected: boolean, force?: boolean) => void;
    setLoading: (loading: boolean) => void;
    setExpanded: (expanded: boolean) => void;
}

export interface TreeNodeProps<T=any> extends TreeNodeState {
    index?: number;
    level?: number;
    padSize?: string;
    disableToggle?: boolean;
    selectOptions?: SelectOptions<T>;
    editOptions?: EditOptions<T>;
    dragOptions?: DragOptions<T>;
    parent?: TreeItem<T>;
    data?: T;
    children?: TreeNodeProps<T>[] | boolean;
    nodeFormatter?: (node: TreeNode<T>) => TreeNode<T>;
    getDefaultNode?: (data: T) => TreeNode<T>;
    getClassNames?: (item: TreeItem<T>) => string|string[]|object;
}
