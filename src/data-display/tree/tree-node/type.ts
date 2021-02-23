export interface TreeNodeState {
    expanded?: boolean;
    selected?: boolean;
    loading?: boolean;
    disabled?: boolean;
}

export interface TreeNode<T=any> extends TreeNodeState {
    _id: string;
    data: T;
    children?: TreeNode<T>[] | boolean;
}

export interface SelectOptions<T=any> {
    disabled?: boolean;
    validator?: (item: TreeNode<T>) => boolean;
}

export interface EditOptions<T=any> {
    disabled?: boolean;
    validator?: (value: string) => boolean;
    invalidText?: string;
    helpText?: string;
    dataSetter?: (editText: string, originData: T) => T;
}

export interface DragOptions<T=any> {
    disabled?: boolean;
    dragValidator?: (item: TreeNode<T>) => boolean;
    dropValidator?: (item: TreeNode<T>) => boolean;
}

export interface TreeItem<T=any> extends TreeNode {
    index: number;
    level: number;
    parent: TreeItem<T>|null;
    el?: HTMLElement;
    deleteNode: () => void;
    addChild: (data: T) => Promise<TreeItem>;
    startEdit: (value?: string) => void;
    finishEdit: (afterFinishEdit?: (node: TreeItem<T>) => void) => void;
    findChildNode: (id: string|number) => TreeItem|null;
    setData: (data: T) => void;
    setChildren: (children: T[] | boolean) => Promise<TreeItem[]>;
    addChildren: (children: T[]) => Promise<TreeItem[]>;
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
}
