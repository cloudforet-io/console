export interface TreeNode<T extends TreeData = any> {
    id: string;
    depth: number;
    isOpen?: boolean;
    data: T;
    loading?: boolean;
    children?: TreeNode<T>[];
}

interface TreeData {
    to?: Location;
}
export interface TreeDisplayMap {
    [id: string]: {
        isOpen: boolean;
    }
}
