import {
    arrayLast, isArray, objectAssignIfNoKey,
} from '@/data-display/tree/he-tree-vue/libs/helpers';

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
        path: number[],
        opt: { reverse?: boolean } = {},
    ): IterableIterator<{ path: number[]; node: Node }> {
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
                yield { path: path0 as number[], node };
            }
        }
    }

    getAllNodes(path: number[]) {
        const all: Node[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { node } of this.iteratePath(path)) {
            all.push(node);
        }
        return all;
    }

    getNode(path: number[]): Node {
        return arrayLast(this.getAllNodes(path));
    }

    getNodeIndexAndParent(path: number[]) {
        const parentPath = path.slice();
        const index = parentPath.pop();
        return { parent: this.getNode(parentPath), index, parentPath };
    }

    getNodeParent(path: number[]) {
        return this.getNodeIndexAndParent(path).parent;
    }

    setPathNode(path: number[], node: Node) {
        if (path == null || path.length === 0) {
            this.data = node;
        } else {
            const { childrenKey, rootChildren } = this;
            const { parent, index } = this.getNodeIndexAndParent(path);
            const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
            if (index !== undefined) parentChildren[index] = node;
        }
    }

    removeNode(path: number[]): Node | undefined {
        const { childrenKey, rootChildren } = this;
        const { parent, index } = this.getNodeIndexAndParent(path);
        const parentChildren = path.length === 1 ? rootChildren : parent[childrenKey];
        if (index === undefined) return undefined;
        const node = parentChildren[index];
        parentChildren.splice(index, 1);
        return node;
    }

    getFamily(path: number[]) {
        const all: Node[] = [];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { node } of this.iteratePath(path)) {
            all.push(node);
        }
        return all;
    }

    get(path: number[]): Node {
        return arrayLast(this.getFamily(path));
    }

    getParentAndIndex(path: number[]) {
        const parentPath = path.slice();
        const index = parentPath.pop();
        return { parent: this.get(parentPath), index, parentPath };
    }

    getParent(path: number[]) {
        return this.getParentAndIndex(path).parent;
    }

    set(path: number[], node: Node) {
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

    delete(path: number[]): Node | undefined {
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
        return _walkTreeData(data, handler, childrenKey, opt);
    }

    clone(
        opt: {
            afterNodeCreated?: (
                newNode: Node,
                info: {
                    oldNode: Node;
                    index: number;
                    parent: Node | undefined;
                    path: number[];
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

export const cloneTreeData = (treeData, opt?) => (new TreeData(treeData)).clone(opt);

export const walkTreeData = (treeData, handler, opt = {}) => (new TreeData(treeData)).walk(handler, opt);

export const getPureTreeData = (treeData) => {
    const opt = {
        afterNodeCreated: (newNode) => {
            Object.keys(newNode).forEach((key) => {
                if (key[0] === '$') {
                    delete newNode[key];
                }
            });
        },
    };
    return cloneTreeData(treeData, opt);
};

type WalkTreeDataCallbackReturn = void|false|'skip children'|'skip siblings';
export type WalkTreeDataHandler<T> = (
    node: T,
    index: number,
    parent: T | null,
    path: number[],
) => WalkTreeDataCallbackReturn;
export type WalkTreeDataCallback = WalkTreeDataHandler<Node>;

type WalkTreeDataOptions = {
    childrenKey?: string;
    reverse?: boolean;
    childFirst?: boolean;
};

/**
 * walk tree data by with depth first search. tree data example: `[{children: [{}, {}]}]`
 * @param obj
 * @param handler
 * @param _opt
 */
function _walkTreeData<T>(
    obj: T | T[],
    handler: WalkTreeDataHandler<T>,
    _opt: WalkTreeDataOptions = {},
) {
    const opt = objectAssignIfNoKey(
        { ..._opt },
        {
            childrenKey: 'children',
        },
    );
    const { childrenKey } = opt;
    const rootChildren = isArray(obj) ? obj : [obj];
    //
    class StopException {}
    const func = (_children, parent, parentPath) => {
        let children = _children;
        if (opt.reverse) {
            children = _children.slice();
            children.reverse();
        }
        const len = children.length;
        for (let i = 0; i < len; i++) {
            const item = children[i];
            const index = opt.reverse ? len - i - 1 : i;
            const path = parentPath ? [...parentPath, index] : [];
            if (opt.childFirst && childrenKey !== undefined) {
                if (item[childrenKey] != null) {
                    func(item[childrenKey], item, path);
                }
            }
            const r = handler(item, index, parent, path);
            if (r === false) {
                // stop
                throw new StopException();
            } else if (r === 'skip children') {
                // eslint-disable-next-line no-continue
                continue;
            } else if (r === 'skip siblings') {
                break;
            }
            if (!opt.childFirst && childrenKey !== undefined) {
                if (item[childrenKey] != null) {
                    func(item[childrenKey], item, path);
                }
            }
        }
    };
    try {
        func(rootChildren, null, isArray(obj) ? [] : null);
    } catch (e) {
        if (e instanceof StopException) {
            // stop
        } else {
            throw e;
        }
    }
}
