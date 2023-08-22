import {
    arrayLast, isArray, walkTreeData,
} from '@/data-display/tree/he-tree-vue/helpers';
import type { TreeDataPath, WalkTreeDataHandler } from '@/data-display/tree/he-tree-vue/types';

export class TreeData<Node> {
    data: Node | Node[];

    childrenKey = 'children';

    // data = null;
    constructor(data: Node | Node[] = []) {
        this.data = data;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    get rootChildren(): Node[] {
        return isArray(this.data) ? this.data : this.data[this.childrenKey];
    }

    * iteratePath(
        path: TreeDataPath,
        opt: { reverse?: boolean } = {},
    ): IterableIterator<{ path: TreeDataPath; node: Node }> {
        const { childrenKey, rootChildren } = this;
        if (!opt.reverse) {
            let prevPath: number[] = [];
            // let prevNode: Node;
            let prevChildren = rootChildren;
            // eslint-disable-next-line no-restricted-syntax
            for (const index of path) {
                const currentPath = [...prevPath, index];
                const currentNode = prevChildren[index];
                yield { path: currentPath, node: currentNode };
                prevPath = currentPath;
                // prevNode = currentNode;
                prevChildren = currentNode[childrenKey];
            }
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const list = [...this.iteratePath(path, { ...opt, reverse: false })];
            list.reverse();
            // eslint-disable-next-line no-restricted-syntax
            for (const { path: path0, node } of list) {
                yield { path: path0 as TreeDataPath, node };
            }
        }
    }

    getAllNodes(path: TreeDataPath) {
        const all: Node[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { node } of this.iteratePath(path)) {
            all.push(node);
        }
        return all;
    }

    getNode(path: TreeDataPath): Node {
        return arrayLast(this.getAllNodes(path));
    }

    getNodeIndexAndParent(path: TreeDataPath) {
        const parentPath = path.slice();
        const index = parentPath.pop();
        return { parent: this.getNode(parentPath), index, parentPath };
    }

    getNodeParent(path: TreeDataPath) {
        return this.getNodeIndexAndParent(path).parent;
    }

    setPathNode(path: TreeDataPath, node: Node) {
        if (path == null || path.length === 0) {
            this.data = node;
        } else {
            const { childrenKey, rootChildren } = this;
            const { parent, index } = this.getNodeIndexAndParent(path);
            const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
            if (index !== undefined) parentChildren[index] = node;
        }
    }

    removeNode(path: TreeDataPath): Node | undefined {
        const { childrenKey, rootChildren } = this;
        const { parent, index } = this.getNodeIndexAndParent(path);
        const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
        if (index === undefined) return undefined;
        const node = parentChildren[index];
        parentChildren.splice(index, 1);
        return node;
    }

    getFamily(path: TreeDataPath) {
        const all: Node[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { node } of this.iteratePath(path)) {
            all.push(node);
        }
        return all;
    }

    get(path: TreeDataPath): Node {
        return arrayLast(this.getFamily(path));
    }

    getParentAndIndex(path: TreeDataPath) {
        const parentPath = path.slice();
        const index = parentPath.pop();
        return { parent: this.get(parentPath), index, parentPath };
    }

    getParent(path: TreeDataPath) {
        return this.getParentAndIndex(path).parent;
    }

    set(path: TreeDataPath, node: Node) {
        if (path == null || path.length === 0) {
            this.data = node;
        } else {
            const { childrenKey } = this;
            const { rootChildren } = this;
            const { parent, index } = this.getParentAndIndex(path);
            let parentChildren: Node[];
            if (path.length === 1) {
                // fix data
                if (!rootChildren) {
                    if (this.data) {
                        this.data[childrenKey] = [];
                    } else {
                        this.data = [];
                    }
                }
                parentChildren = rootChildren;
            } else {
                if (!parent[childrenKey]) {
                    parent[childrenKey] = [];
                }
                parentChildren = parent[childrenKey];
            }
            if (index !== undefined) parentChildren[index] = node;
        }
    }

    delete(path: TreeDataPath): Node | undefined {
        const { childrenKey, rootChildren } = this;
        const { parent, index } = this.getParentAndIndex(path);
        const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
        if (index !== undefined) {
            const node = parentChildren[index];
            parentChildren.splice(index, 1);
            return node;
        }
        return undefined;
    }

    walk(handler: WalkTreeDataHandler<Node>, opt?: { reverse?: boolean }) {
        const { childrenKey, data } = this;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return walkTreeData(data, handler, childrenKey, opt);
    }

    clone(
        opt: {
            afterNodeCreated?: (
                newNode: Node,
                info: {
                    oldNode: Node;
                    index: number;
                    parent: Node | undefined;
                    path: TreeDataPath;
                }
            ) => void;
        } = {},
    ) {
        // opt.afterNodeCreated(newNode, {oldNode: node, index, parent, path})
        const { childrenKey } = this;
        const td = new TreeData();
        td.childrenKey = childrenKey;
        this.walk((node, index, parent, path) => {
            const newNode = { ...node };
            if (newNode[childrenKey]) {
                newNode[childrenKey] = [];
            }
            if (opt.afterNodeCreated) {
                opt.afterNodeCreated(newNode, {
                    oldNode: node, index, parent: parent ?? undefined, path,
                });
            }
            td.setPathNode(path, newNode);
        });
        return td.data as Node[];
    }
}
