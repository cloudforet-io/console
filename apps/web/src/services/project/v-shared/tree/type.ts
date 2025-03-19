import type { Location } from 'vue-router/types/router';

export interface TreeNode<T extends TreeData = any> {
    id: string;
    depth: number;
    isOpen?: boolean;
    data: T;
    loading?: boolean;
    children?: TreeNode<T>[];
}

export interface TreeData {
    to?: Location;
}
export interface TreeDisplayMap {
    [id: string]: {
        isOpen: boolean;
    }
}
