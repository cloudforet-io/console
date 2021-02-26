import { TreeItem } from './tree-node/type';

export interface RootTreeNode<T> extends TreeItem<T> {
    findNode<T>(id: string|number, paths: Array<string|number>): Promise<TreeItem<T>|null>;
}
