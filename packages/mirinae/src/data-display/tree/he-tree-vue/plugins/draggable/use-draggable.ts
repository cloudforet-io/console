import { onMounted, watch } from 'vue';

import {
    arrayLast,
    arrayWithoutEnd,
    findParent,
    hasClass, iterateAll,
    resolveValueOrGetter,
} from '@/data-display/tree/he-tree-vue/helpers';
import makeTreeDraggable from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable';
import type { Store } from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable-types';
import type { Node } from '@/data-display/tree/he-tree-vue/types';

export const useDraggable = (props, emit, {
    treeRef, rootNodeRef, getTreeVmByTreeEl, getAllNodesByPath,
}) => {
    const treesStore = {} as {
        store: Store;
    };
    const options = {
        indent: props.indent,
        triggerClass: props.triggerClass,
        triggerBySelf: props.triggerBySelf,
        unfoldWhenDragover: props.unfoldWhenDragover,
        unfoldWhenDragoverDelay: props.unfoldWhenDragoverDelay,
        draggingNodePositionMode: props.draggingNodePositionMode,
        edgeScroll: props.edgeScroll,
        edgeScrollTriggerMargin: props.edgeScrollTriggerMargin,
        edgeScrollSpeed: props.edgeScrollSpeed,
        edgeScrollTriggerMode: props.edgeScrollTriggerMode,
        edgeScrollSpecifiedContainerX: props.edgeScrollSpecifiedContainerX,
        edgeScrollSpecifiedContainerY: props.edgeScrollSpecifiedContainerY,
        rtl: props.rtl,
        preventTextSelection: props.preventTextSelection,
        treeClass: 'he-tree',
        rootClass: 'tree-root',
        childrenClass: 'tree-children',
        branchClass: 'tree-branch',
        nodeClass: 'tree-node',
        nodeBackClass: 'tree-node-back',
        placeholderClass: 'tree-placeholder',
        placeholderNodeBackClass: 'tree-placeholder-node-back',
        placeholderNodeClass: 'tree-placeholder-node',
        draggingClass: 'dragging',
        placeholderId: 'he_tree_drag_placeholder',
        ifNodeFolded: (branchEl, store) => {
            const { targetTree } = store;
            const node = targetTree.getNodeByBranchEl(branchEl);
            return node.$folded;
        },
        isTargetTreeRootDroppable: (store) => {
            const droppable = resolveValueOrGetter(store.targetTree.rootNode.$droppable, [store.targetTree, store]);
            if (droppable !== undefined) {
                return droppable;
            }
            return true;
        },
        unfoldTargetNodeByEl: (branchEl, store) => _Draggable_unfoldTargetNodeByEl(branchEl, store),
        isNodeParentDroppable: (branchEl, treeEl) => {
            const tree = getTreeVmByTreeEl(treeEl);
            const path = tree.getPathByBranchEl(branchEl);
            const parentPath = arrayWithoutEnd(path, 1);
            const parent = tree.getNodeByPath(parentPath);
            return tree.isNodeDroppable(parent, parentPath);
        },
        isNodeDroppable: (branchEl, treeEl) => {
            const tree = getTreeVmByTreeEl(treeEl);
            const path = tree.getPathByBranchEl(branchEl);
            const node = tree.getNodeByPath(path);
            return tree.isNodeDroppable(node, path);
        },
        _findClosestDroppablePosition: (branchEl, treeEl) => {
            const tree = getTreeVmByTreeEl(treeEl);
            const path = tree.getPathByBranchEl(branchEl);
            const findPath = arrayWithoutEnd(path, 1);
            let cur = path;
            // eslint-disable-next-line no-restricted-syntax
            for (const { node, path: _path } of tree.iteratePath(findPath, { reverse: true })) {
                if (tree.isNodeDroppable(node, _path)) {
                    return tree.getBranchElByPath(cur);
                }
                cur = _path;
            }
            if (tree.isNodeDroppable(rootNodeRef.value, [])) {
                return tree.getBranchElByPath(cur);
            }
            return undefined;
        },
        afterPlaceholderCreated: (store) => {
            store.startTree.$emit('afterPlaceholderCreated', store);
            store.startTree.$emit('after-placeholder-created', store);
        },
        getPathByBranchEl: (branchEl) => getPathByBranchEl(branchEl),
        beforeFirstMove: (store) => {
            treesStore.store = store;
            store.startTree = getTreeVmByTreeEl(store.startTreeEl);
            const draggable = store.startTree.draggable;
            if (!draggable) return false;
            const { startTree, startPath } = store;
            store.dragNode = startTree.getNodeByPath(startPath);
            if (!startTree.isNodeDraggable(store.dragNode, startPath)) {
                return false;
            }
            if (startTree.hasHook('ondragstart') && startTree.executeHook('ondragstart', [store]) === false) {
                return false;
            }
            store.startTree.$emit('before-first-move', store);
            store.startTree.$emit('drag', store);
            emit('he-tree-drag', store);
            return undefined;
        },
        filterTargetTree: (targetTreeEl, store) => {
            const targetTree = getTreeVmByTreeEl(targetTreeEl);
            const { startTree } = store;
            if (startTree !== targetTree) {
                return false;
            }
            const targetTreeDroppable = resolveValueOrGetter(targetTree.droppable, [store]);
            if (!targetTreeDroppable) {
                return false;
            }
            store.targetTree = targetTree;
            return undefined;
        },
        afterMove: (store) => {
            store.startTree.$emit('after-move', store);
        },
        beforeDrop: (pathChanged, store) => {
            const { targetTree } = store;
            if (targetTree.hasHook('ondragend') && targetTree.executeHook('ondragend', [store]) === false) {
                return false;
            }
            emit('he-tree-before-drop', store);
            return undefined;
        },
        afterDrop: (store) => {
            if (store.pathChanged) {
                const {
                    startTree, targetTree, startPath, dragNode,
                } = store;
                let { targetPath } = store;
                // remove from start position
                const startParentPath = arrayWithoutEnd(startPath, 1);
                const startParent = startTree.getNodeByPath(startParentPath);
                const startSiblings = startParentPath.length === 0 ? startTree.treeData : startParent.children;
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
                if (startTree === targetTree) {
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
                const targetParent = targetTree.getNodeByPath(targetParentPath);
                let targetSiblings;
                if (targetParentPath.length === 0) {
                    targetSiblings = targetTree.treeData;
                } else {
                    if (!targetParent.children) {
                        targetParent.children = [];
                    }
                    targetSiblings = targetParent.children;
                }
                const targetIndex = arrayLast(targetPath);
                targetSiblings.splice(targetIndex, 0, dragNode);

                const rollback = () => {
                    // remove inserted node from target position
                    const _targetParentPath = arrayWithoutEnd(targetPath, 1);
                    const _targetParent = targetTree.getNodeByPath(_targetParentPath);
                    const _targetSiblings = _targetParentPath.length === 0 ? targetTree.treeData : _targetParent.children;
                    const _targetIndex = arrayLast(targetPath);
                    _targetSiblings.splice(_targetIndex, 1);

                    // add node to start position
                    const _startParentPath = arrayWithoutEnd(startPath, 1);
                    const _startParent = startTree.getNodeByPath(_startParentPath);
                    // const startSiblings = _startParentPath.length === 0 ? startTree.treeData : _startParent.children;
                    let _startSiblings;
                    if (_startParentPath.length === 0) {
                        _startSiblings = startTree.treeData;
                    } else {
                        if (!_startParent.children) {
                            _startParent.children = [];
                        }
                        _startSiblings = _startParent.children;
                    }
                    const _startIndex = arrayLast(startPath);
                    _startSiblings.splice(_startIndex, 0, dragNode);
                };

                // emit event
                startTree.$emit('input', startTree.treeData);
                startTree.$emit('change', store);
                targetTree.$emit('drop', store, targetPath, rollback);
                emit('he-tree-drop', store);
                if (targetTree !== startTree) {
                    targetTree.$emit('input', targetTree.treeData);
                    targetTree.$emit('change', store);
                }
                return new Promise<void>((resolve) => {
                    targetTree.$nextTick(() => {
                        resolve();
                    });
                });
            }
            return undefined;
        },
    };

    const _Draggable_unfoldTargetNodeByEl = (branchEl, store) => {
        const { targetTree } = store;
        const path = targetTree.getPathByBranchEl(branchEl);
        const node = targetTree.getNodeByPath(path);
        targetTree?.unfold(node, path);
        return new Promise<void>((resolve) => {
            targetTree.$nextTick(() => {
                resolve();
            });
        });
    };

    const getPathByBranchEl = (branchEl) => {
        const getAttrPath = (el) => {
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
        let parentPath;
        findParent(branchEl, (el) => {
            if (hasClass(el, 'tree-root')) {
                parentPath = [];
                return true;
            }
            if (hasClass(el, 'tree-branch')) {
                parentPath = getAttrPath(el);
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

    const isNodeDraggable = (node, path) => {
        const { store } = treesStore;
        const allNodes = getAllNodesByPath(path);
        allNodes.unshift(rootNodeRef.value);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { value: _node, index } of iterateAll<Node>(allNodes, { reverse: true })) {
            const currentPath = path.slice(0, (index ?? 0) + 1);
            const draggableOpt = _node.$draggable !== undefined ? _node.$draggable : props.eachDraggable;
            const draggable = resolveValueOrGetter(draggableOpt, [currentPath, store]);
            if (draggable !== undefined) {
                return draggable;
            }
        }
        return true;
    };
    const isNodeDroppable = (node, path) => {
        const { store } = treesStore;
        const allNodes = getAllNodesByPath(path);
        allNodes.unshift(rootNodeRef.value);
        let droppableFinal; let
            resolved;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-restricted-syntax
        for (const { value: _node, index } of iterateAll<Node>(allNodes, { reverse: true })) {
            const currentPath = path.slice(0, (index ?? 0) + 1);
            const droppableOpt = _node.$droppable !== undefined ? _node.$droppable : props.eachDroppable;
            const droppable = resolveValueOrGetter(droppableOpt, [currentPath, store]);
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
        // override
        getPathByBranchEl,
    };

    onMounted(() => {
        const _makeTreeDraggable_obj = makeTreeDraggable(treeRef.value, options);
        // watch props and update options
        ['indent',
            'triggerClass',
            'triggerBySelf',
            'unfoldWhenDragover',
            'unfoldWhenDragoverDelay',
            'draggingNodePositionMode',
            'edgeScroll', 'edgeScrollTriggerMargin', 'edgeScrollSpeed', 'edgeScrollTriggerMode', 'edgeScrollSpecifiedContainerY', 'edgeScrollSpecifiedContainerY',
            'rtl',
            'preventTextSelection',
        ].forEach((name) => {
            watch(() => props[name], (value) => {
                _makeTreeDraggable_obj.options[name] = value;
                _makeTreeDraggable_obj.optionsUpdated();
            });
        });
    });

    return {
        treesStore,
        methods,
    };
};
