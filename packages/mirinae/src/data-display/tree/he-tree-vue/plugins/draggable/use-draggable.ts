/* eslint-disable no-restricted-syntax */
import type { Ref } from 'vue';
import { onMounted, watch, nextTick } from 'vue';

import {
    arrayLast,
    arrayWithoutEnd,
    findParent,
    hasClass, iterateAll, joinFunctionsByNext,
} from '@/data-display/tree/he-tree-vue/helpers';
import type { TreeDraggableOptions } from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable';
import makeTreeDraggable from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable';
import type { Store } from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable-types';
import type { Node } from '@/data-display/tree/he-tree-vue/types';

interface UseDraggableOptions {
    treeRef: Ref<HTMLElement|null>;
    rootNode: Ref<Node>;
    treeData: Ref<Node[]>;
    getAllNodesByPath: (path: number[]) => Node[];
    getNodeByPath: (path: number[]) => Node|undefined;
    getNodeByBranchEl: (branchEl: HTMLElement) => Node;
    getBranchElByPath: (path: number[]) => Element|null;
    iteratePath: (path: number[], opt?: { reverse?: boolean }) => IterableIterator<{ path: number[]; node: Node }>;
    unfold: (node: Node, path: number[]) => void;
}
export const useDraggable = (props, emit, {
    treeRef, rootNode, treeData,
    getAllNodesByPath, getNodeByPath, getNodeByBranchEl, getBranchElByPath, iteratePath, unfold,
}: UseDraggableOptions) => {
    const treesStore = {} as {
        store: Store;
    };
    const options: TreeDraggableOptions = {
        indent: props.indent,
        unfoldWhenDragover: props.unfoldWhenDragover,
        unfoldWhenDragoverDelay: props.unfoldWhenDragoverDelay,
        treeClass: 'he-tree',
        rootClass: 'tree-root',
        childrenClass: 'tree-children',
        branchClass: 'tree-branch',
        nodeClass: 'tree-node',
        nodeBackClass: 'tree-node-back',
        placeholderClass: 'tree-placeholder',
        placeholderNodeBackClass: 'tree-placeholder-node-back',
        placeholderNodeClass: 'tree-placeholder-node',
        draggingClassName: 'dragging',
        placeholderId: 'he_tree_drag_placeholder',
        draggingNodePositionMode: 'top_left_corner',
        // draggable helper options
        rtl: props.rtl,
        triggerClassName: 'tree-node',
        edgeScrollTriggerMargin: 50,
        edgeScrollSpeed: 0.35,
        edgeScrollTriggerMode: 'top_left_corner',
        preventTextSelection: true,
        ifNodeFolded: (branchEl: HTMLElement): boolean|undefined => {
            const node = getNodeByBranchEl(branchEl);
            return node.$folded;
        },
        isTargetTreeRootDroppable: (store:Store) => {
            const droppableFunc = rootNode.value.$droppable;
            const droppable = droppableFunc ? droppableFunc([], store) : false;
            return droppable;
        },
        unfoldTargetNodeByEl: (branchEl: HTMLElement) => _Draggable_unfoldTargetNodeByEl(branchEl),
        isNodeParentDroppable: (branchEl: HTMLElement) => {
            const path = getPathByBranchEl(branchEl);
            const parentPath = arrayWithoutEnd<number>(path, 1);
            const parent = getNodeByPath(parentPath);
            if (parent) return isNodeDroppable(parent, parentPath);
            return undefined;
        },
        isNodeDroppable: (branchEl: HTMLElement) => {
            const path = getPathByBranchEl(branchEl);
            const node = getNodeByPath(path);
            if (node) return isNodeDroppable(node, path);
            return undefined;
        },
        _findClosestDroppablePosition: (branchEl: HTMLElement) => {
            const path = getPathByBranchEl(branchEl);
            const findPath = arrayWithoutEnd(path, 1);
            let cur = path;
            const iteratePaths = iteratePath(findPath, { reverse: true });
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            for (const { node, path: _path } of iteratePaths) {
                if (isNodeDroppable(node, _path)) {
                    return getBranchElByPath(cur);
                }
                cur = _path;
            }
            if (isNodeDroppable(rootNode.value, [])) {
                return getBranchElByPath(cur);
            }
            return undefined;
        },
        afterPlaceholderCreated: (store: Store) => {
            emit('after-placeholder-created', store);
        },
        getPathByBranchEl: (branchEl: HTMLElement) => getPathByBranchEl(branchEl),
        beforeFirstMove: (store: Store) => {
            treesStore.store = store;
            if (!store.startTreeEl) return undefined;
            if (!props.draggable) return false;
            const { startPath } = store;
            if (!startPath) return undefined;
            store.dragNode = getNodeByPath(startPath);
            if (store.dragNode && !isNodeDraggable(store.dragNode, startPath)) {
                return false;
            }
            if (props.ondragstart && joinFunctionsByNext([props.ondragstart])(store) === false) {
                return false;
            }
            emit('before-first-move', store);
            emit('drag', store);
            emit('he-tree-drag', store);
            return undefined;
        },
        filterTargetTree: () => {
            if (!props.droppable) return false;
            return undefined;
        },
        afterMove: (store: Store) => {
            emit('after-move', store);
        },
        beforeDrop: (store: Store) => {
            console.debug('beforeDrop', joinFunctionsByNext([props.ondragend])(store));
            if (props.ondragend && joinFunctionsByNext([props.ondragend])(store) === false) {
                return false;
            }
            emit('he-tree-before-drop', store);
            return undefined;
        },
        afterDrop: (store: Store) => {
            if (store.pathChanged) {
                const {
                    startPath, dragNode,
                } = store;
                let { targetPath } = store;

                if (!startPath || !targetPath) return undefined;

                // remove from start position
                const startParentPath = arrayWithoutEnd(startPath, 1);
                const startParent = getNodeByPath(startParentPath);
                const startSiblings = startParentPath.length === 0 ? treeData.value : startParent?.children ?? [];
                const startIndex = arrayLast(startPath);
                startSiblings.splice(startIndex, 1);
                // remove node from the starting position may affect the target path.
                // example
                //  startPath   targetPath
                //  [0]         [1]
                //  [0]         [1, 0]
                //  [3, 1]      [3, 3]
                //  [3, 1]      [3, 3, 5]
                // above targetPaths should be transformed to [0], [0, 0] [3, 2] [3, 2, 5]
                if (JSON.stringify(startPath) === JSON.stringify(targetPath)) {
                    if (startPath.length <= targetPath.length) {
                        const sw = startPath.slice(0, startPath.length - 1); // without end
                        const tw = targetPath.slice(0, sw.length); // same length with sw
                        if (sw.toString() === tw.toString()) {
                            const endIndex = sw.length;
                            if (startPath[endIndex] < targetPath[endIndex]) {
                                targetPath = targetPath.slice(0); // create a copy of targetPath
                                targetPath[endIndex] -= 1;
                            } else if (startPath[endIndex] === targetPath[endIndex]) {
                                console.error('Draggable.afterDrop: That is impossible!');
                            }
                        }
                    }
                }
                // insert to target position
                const targetParentPath = arrayWithoutEnd(targetPath, 1);
                const targetParent = getNodeByPath(targetParentPath) ?? {};
                let targetSiblings: any[]|undefined;
                if (targetParentPath.length === 0) {
                    targetSiblings = treeData.value;
                } else {
                    if (!targetParent.children) {
                        targetParent.children = [];
                    }
                    targetSiblings = targetParent.children;
                }
                const targetIndex = arrayLast(targetPath);
                targetSiblings?.splice(targetIndex, 0, dragNode);

                const rollback = () => {
                    if (!targetPath) return;
                    // remove inserted node from target position
                    const _targetParentPath = arrayWithoutEnd(targetPath, 1);
                    const _targetParent = getNodeByPath(_targetParentPath);
                    const _targetSiblings = _targetParentPath.length === 0 ? treeData.value : _targetParent?.children ?? [];
                    const _targetIndex = arrayLast(targetPath);
                    _targetSiblings.splice(_targetIndex, 1);

                    // add node to start position
                    const _startParentPath = arrayWithoutEnd(startPath, 1);
                    const _startParent = getNodeByPath(_startParentPath) ?? {};
                    // const startSiblings = _startParentPath.length === 0 ? startTree.treeData : _startParent.children;
                    let _startSiblings: any[]|undefined;
                    if (_startParentPath.length === 0) {
                        _startSiblings = treeData.value;
                    } else {
                        if (!_startParent.children) {
                            _startParent.children = [];
                        }
                        _startSiblings = _startParent.children;
                    }
                    const _startIndex = arrayLast(startPath);
                    _startSiblings?.splice(_startIndex, 0, dragNode);
                };

                // emit event
                emit('input', treeData.value);
                emit('change', store);
                emit('drop', store, targetPath, rollback);
                emit('he-tree-drop', store);
                // if (targetTree !== startTree) {
                //     emit('input', treeData.value);
                //     emit('change', store);
                // }
                return new Promise<void>((resolve) => {
                    nextTick(() => {
                        resolve();
                    });
                });
            }
            return undefined;
        },
    };

    const _Draggable_unfoldTargetNodeByEl = (branchEl: HTMLElement) => {
        const path = getPathByBranchEl(branchEl);
        const node = getNodeByPath(path);
        if (node) unfold(node, path);
        return new Promise<void>((resolve) => {
            nextTick(() => {
                resolve();
            });
        });
    };

    const getPathByBranchEl = (branchEl: HTMLElement) => {
        const getAttrPath = (el: Element) => {
            const pathStr = el.getAttribute('data-tree-node-path');
            if (pathStr) {
                return pathStr.split(',').map((v) => parseInt(v));
            }
            return undefined;
        };
        const path = getAttrPath(branchEl);
        if (path) {
            return path;
        }
        // placeholder path
        let parentPath: number[] = [];
        findParent(branchEl, (el) => {
            if (hasClass(el, 'tree-root')) {
                parentPath = [];
                return true;
            }
            if (hasClass(el, 'tree-branch')) {
                parentPath = getAttrPath(el) ?? [];
                return true;
            }
            return false;
        });
        let index = 0;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { value: el } of iterateAll<HTMLElement>(branchEl.parentElement.children)) {
            if (hasClass(el, 'tree-branch') || hasClass(el, 'tree-placeholder')) {
                if (el === branchEl) {
                    break;
                }
                index++;
            }
        }
        return [...parentPath, index];
    };

    const isNodeDraggable = (node: Node, path: number[]): boolean|undefined => {
        const { store } = treesStore;
        const allNodes = getAllNodesByPath(path);
        allNodes.unshift(rootNode.value);
        const iteratePaths = iterateAll<Node>(allNodes, { reverse: true });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const { value: _node, index } of iteratePaths) {
            const currentPath = path.slice(0, (index ?? 0) + 1);
            const draggableOpt = _node.$draggable !== undefined ? _node.$draggable : props.eachDraggable;
            const draggable = draggableOpt ? draggableOpt(currentPath, store) : undefined;
            if (draggable !== undefined) return draggable;
        }
        return true;
    };
    const isNodeDroppable = (node: Node, path: number[]) => {
        const { store } = treesStore;
        const allNodes = getAllNodesByPath(path);
        allNodes.unshift(rootNode.value);
        let droppableFinal: boolean|undefined;
        let resolved: boolean|undefined;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const { value: _node, index } of iterateAll<Node>(allNodes, { reverse: true })) {
            const currentPath = path.slice(0, (index ?? 0) + 1);
            const droppableOpt = _node.$droppable !== undefined ? _node.$droppable : props.eachDroppable;
            const droppable = droppableOpt ? droppableOpt(currentPath, store) : undefined;
            if (droppable !== undefined) {
                droppableFinal = droppable;
                resolved = true;
                break;
            }
        }
        if (!resolved) {
            droppableFinal = true;
        }
        return droppableFinal;
    };

    const methods = {
        isNodeDraggable,
        isNodeDroppable,
        getPathByBranchEl,
    };

    onMounted(() => {
        if (treeRef.value) {
            const _makeTreeDraggable_obj = makeTreeDraggable(treeRef.value, options);
            // watch props and update options
            ['indent', 'unfoldWhenDragover', 'unfoldWhenDragoverDelay', 'rtl'].forEach((name) => {
                watch(() => props[name], (value) => {
                    _makeTreeDraggable_obj.options[name] = value;
                    _makeTreeDraggable_obj.optionsUpdated();
                });
            });
        }
    });

    return {
        treesStore,
        methods,
    };
};
