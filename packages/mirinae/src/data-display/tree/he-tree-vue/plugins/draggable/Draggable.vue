<script lang="ts">
// @ts-nocheck
import { defineComponent } from 'vue';

import {
    arrayLast,
    arrayWithoutEnd, findParent, hasClass, iterateAll, resolveValueOrGetter,
} from '../../helpers';
import { Node } from '../../types';
import * as ut from '../../utils';
import makeTreeDraggable from './draggable';
import { Store } from './draggable-types';

const treesStore = {} as {store: Store};

export default defineComponent({
    props: {
        triggerClass: { type: [String, Array], default: 'tree-node' },
        triggerBySelf: { type: Boolean },
        draggable: { type: [Boolean, Function], default: true },
        droppable: { type: [Boolean, Function], default: true },
        eachDraggable: { type: [Function] }, // type: [Boolean, Function]
        eachDroppable: { type: [Function] }, // type: [Boolean, Function]
        ondragstart: { type: Function },
        ondragend: { type: Function },
        unfoldWhenDragover: { type: Boolean, default: true },
        unfoldWhenDragoverDelay: { type: Number, default: 30 },
        draggingNodePositionMode: { type: String, default: 'top_left_corner' }, // top_left_corner, mouse
        edgeScroll: { type: Boolean },
        edgeScrollTriggerMargin: { type: Number, default: 50 },
        edgeScrollSpeed: { type: Number, default: 0.35 },
        edgeScrollTriggerMode: { type: String, default: 'top_left_corner' },
        edgeScrollSpecifiedContainerX: {}, // HTMLElement || ((store) => HTMLElement)
        edgeScrollSpecifiedContainerY: {}, // HTMLElement || ((store) => HTMLElement)
        preventTextSelection: { type: Boolean, default: true },
    },
    data() {
        return {
            treesStore,
        };
    },
    mounted() {
        const options = this._draggableOptions = {
            indent: this.indent,
            triggerClass: this.triggerClass,
            triggerBySelf: this.triggerBySelf,
            unfoldWhenDragover: this.unfoldWhenDragover,
            unfoldWhenDragoverDelay: this.unfoldWhenDragoverDelay,
            draggingNodePositionMode: this.draggingNodePositionMode,
            cloneWhenDrag: this.cloneWhenDrag,
            edgeScroll: this.edgeScroll,
            edgeScrollTriggerMargin: this.edgeScrollTriggerMargin,
            edgeScrollSpeed: this.edgeScrollSpeed,
            edgeScrollTriggerMode: this.edgeScrollTriggerMode,
            edgeScrollSpecifiedContainerX: this.edgeScrollSpecifiedContainerX,
            edgeScrollSpecifiedContainerY: this.edgeScrollSpecifiedContainerY,
            rtl: this.rtl,
            preventTextSelection: this.preventTextSelection,
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
                // @ts-ignore
                const droppable = resolveValueOrGetter(store.targetTree.rootNode.$droppable, [store.targetTree, store]);
                if (droppable !== undefined) {
                    return droppable;
                }
                return true;
            },
            // @ts-ignore
            unfoldTargetNodeByEl: (...args) => this._Draggable_unfoldTargetNodeByEl(...args),
            isNodeParentDroppable: (branchEl, treeEl) => {
                // @ts-ignore
                const tree = this.getTreeVmByTreeEl(treeEl);
                const path = tree.getPathByBranchEl(branchEl);
                const parentPath = arrayWithoutEnd(path, 1);
                const parent = tree.getNodeByPath(parentPath);
                return tree.isNodeDroppable(parent, parentPath);
            },
            isNodeDroppable: (branchEl, treeEl) => {
                // @ts-ignore
                const tree = this.getTreeVmByTreeEl(treeEl);
                const path = tree.getPathByBranchEl(branchEl);
                const node = tree.getNodeByPath(path);
                return tree.isNodeDroppable(node, path);
            },
            _findClosestDroppablePosition: (branchEl, treeEl) => {
                // @ts-ignore
                const tree = this.getTreeVmByTreeEl(treeEl);
                const path = tree.getPathByBranchEl(branchEl);
                const findPath = arrayWithoutEnd(path, 1);
                let cur = path;
                for (const { node, path } of tree.iteratePath(findPath, { reverse: true })) {
                    if (tree.isNodeDroppable(node, path)) {
                        return tree.getBranchElByPath(cur);
                    }
                    cur = path;
                }
                if (tree.isNodeDroppable(this.rootNode, [])) {
                    return tree.getBranchElByPath(cur);
                }
            },
            afterPlaceholderCreated: (store) => {
                store.startTree.$emit('afterPlaceholderCreated', store);
                store.startTree.$emit('after-placeholder-created', store);
            },
            getPathByBranchEl: branchEl => this.getPathByBranchEl(branchEl),
            beforeFirstMove: (store) => {
                this.treesStore.store = store;
                // @ts-ignore
                store.startTree = this.getTreeVmByTreeEl(store.startTreeEl);
                const draggable = resolveValueOrGetter(store.startTree.draggable, [store.startTree, store]);
                if (!draggable) {
                    return false;
                }
                const { startTree, startPath } = store;
                store.dragNode = startTree.getNodeByPath(startPath);
                if (this.cloneWhenDrag) {
                    store.dragNode = ut.cloneTreeData(store.dragNode);
                }
                if (!startTree.isNodeDraggable(store.dragNode, startPath)) {
                    return false;
                }
                if (startTree.hasHook('ondragstart') && startTree.executeHook('ondragstart', [startTree, store]) === false) {
                    return false;
                }
                store.startTree.$emit('before-first-move', store);
                store.startTree.$emit('drag', store);
                this.$root.$emit('he-tree-drag', store);
            },
            filterTargetTree: (targetTreeEl, store) => {
                // @ts-ignore
                const targetTree = this.getTreeVmByTreeEl(targetTreeEl);
                const { startTree } = store;
                if (startTree !== targetTree) {
                    if (this._internal_hook_filterTargetTree) {
                        // @ts-ignore
                        if (this._internal_hook_filterTargetTree(targetTree, store) === false) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
                const targetTreeDroppable = resolveValueOrGetter(targetTree.droppable, [targetTree, store]);
                if (!targetTreeDroppable) {
                    return false;
                }
                store.targetTree = targetTree;
                // @ts-ignore
                if (!resolveValueOrGetter(store.startTree === store.targetTree) && resolveValueOrGetter(this._Draggable_unfoldTargetNode, [false, this.treeData]) !== this.rootNode.children) {
                    return false;
                }
            },
            afterMove: (store) => {
                store.startTree.$emit('after-move', store);
            },
            beforeDrop: (pathChanged, store) => {
                const { targetTree } = store;
                if (targetTree.hasHook('ondragend') && targetTree.executeHook('ondragend', [targetTree, store]) === false) {
                    return false;
                }
                this.$root.$emit('he-tree-before-drop', store);
            },
            afterDrop: (store, t) => {
                if (store.pathChanged) {
                    const {
                        startTree, targetTree, startPath, dragNode,
                    } = store;
                    let { targetPath } = store;
                    if (this.cloneWhenDrag !== true) {
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
                    }
                    // insert to target position
                    const targetParentPath = arrayWithoutEnd(targetPath, 1);
                    const targetParent = targetTree.getNodeByPath(targetParentPath);
                    let targetSiblings;
                    if (targetParentPath.length === 0) {
                        targetSiblings = targetTree.treeData;
                    } else {
                        if (!targetParent.children) {
                            this.$set(targetParent, 'children', []);
                        }
                        targetSiblings = targetParent.children;
                    }
                    const targetIndex = arrayLast(targetPath);
                    targetSiblings.splice(targetIndex, 0, dragNode);

                    const rollback = () => {
                        // remove inserted node from target position
                        const targetParentPath = arrayWithoutEnd(targetPath, 1);
                        const targetParent = targetTree.getNodeByPath(targetParentPath);
                        const targetSiblings = targetParentPath.length === 0 ? targetTree.treeData : targetParent.children;
                        const targetIndex = arrayLast(targetPath);
                        targetSiblings.splice(targetIndex, 1);

                        // add node to start position
                        const startParentPath = arrayWithoutEnd(startPath, 1);
                        const startParent = startTree.getNodeByPath(startParentPath);
                        // const startSiblings = startParentPath.length === 0 ? startTree.treeData : startParent.children;
                        let startSiblings;
                        if (startParentPath.length === 0) {
                            startSiblings = startTree.treeData;
                        } else {
                            if (!startParent.children) {
                                this.$set(startParent, 'children', []);
                            }
                            startSiblings = startParent.children;
                        }
                        const startIndex = arrayLast(startPath);
                        startSiblings.splice(startIndex, 0, dragNode);
                    };

                    // emit event
                    startTree.$emit('input', startTree.treeData);
                    startTree.$emit('change', store);
                    targetTree.$emit('drop', store, targetPath, rollback);
                    this.$root.$emit('he-tree-drop', store);
                    if (targetTree !== startTree) {
                        targetTree.$emit('input', targetTree.treeData);
                        targetTree.$emit('change', store);
                    }
                    return new Promise<void>((resolve, reject) => {
                        targetTree.$nextTick(() => {
                            resolve();
                        });
                    });
                }
            },
        };
        const _makeTreeDraggable_obj = this._makeTreeDraggable_obj = makeTreeDraggable(this.$el, options);
        // watch props and update options
        ['indent',
            'triggerClass',
            'triggerBySelf',
            'unfoldWhenDragover',
            'unfoldWhenDragoverDelay',
            'draggingNodePositionMode',
            'cloneWhenDrag',
            'edgeScroll', 'edgeScrollTriggerMargin', 'edgeScrollSpeed', 'edgeScrollTriggerMode', 'edgeScrollSpecifiedContainerY', 'edgeScrollSpecifiedContainerY',
            'rtl',
            'preventTextSelection',
        ].forEach((name) => {
            this.$watch(name, (value) => {
                _makeTreeDraggable_obj.options[name] = value;
                _makeTreeDraggable_obj.optionsUpdated();
            });
        });
    },
    // computed: {},
    // watch: {},
    methods: {
        _Draggable_unfoldTargetNodeByEl(branchEl, store) {
            const { targetTree } = store;
            const path = targetTree.getPathByBranchEl(branchEl);
            const node = targetTree.getNodeByPath(path);
            targetTree.unfold && targetTree.unfold(node, path);
            return new Promise<void>((resolve, reject) => {
                targetTree.$nextTick(() => {
                    resolve();
                });
            });
        },
        isNodeDraggable(node, path) {
            const { store } = this.treesStore;
            // @ts-ignore
            const allNodes = this.getAllNodesByPath(path);
            allNodes.unshift(this.rootNode);
            for (const { value: node, index } of iterateAll<Node>(allNodes, { reverse: true })) {
                const currentPath = path.slice(0, (index ?? 0) + 1);
                const draggableOpt = node.$draggable !== undefined ? node.$draggable : this.eachDraggable;
                const draggable = resolveValueOrGetter(draggableOpt, [currentPath, this, store]);
                if (draggable === undefined) {
                    continue;
                } else {
                    return draggable;
                }
            }
            return true;
        },
        isNodeDroppable(node, path) {
            const { store } = this.treesStore;
            // @ts-ignore
            const allNodes = this.getAllNodesByPath(path);
            allNodes.unshift(this.rootNode);
            let droppableFinal; let
                resolved;
            for (const { value: node, index } of iterateAll<Node>(allNodes, { reverse: true })) {
                const currentPath = path.slice(0, (index ?? 0) + 1);
                const droppableOpt = node.$droppable !== undefined ? node.$droppable : this.eachDroppable;
                const droppable = resolveValueOrGetter(droppableOpt, [currentPath, this, store]);
                if (droppable === undefined) {
                    continue;
                } else {
                    droppableFinal = droppable;
                    resolved = true;
                    break;
                }
            }
            if (!resolved) {
                droppableFinal = true;
            }
            if (this._internal_hook_isNodeDroppable) {
                // @ts-ignore
                return this._internal_hook_isNodeDroppable({
                    droppableFinal, node, path, store,
                });
            }
            return droppableFinal;
        },
        // override
        getPathByBranchEl(branchEl) {
            const store = this.treesStore.store;
            const getAttrPath = (el) => {
                const pathStr = el.getAttribute('data-tree-node-path');
                if (pathStr) {
                    return pathStr.split(',').map(v => parseInt(v));
                }
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
            for (const { value: el, index: index2 } of iterateAll<HTMLElement>(branchEl.parentElement.children)) {
                if (hasClass(el, 'tree-branch') || hasClass(el, 'tree-placeholder')) {
                    if (el === branchEl) {
                        break;
                    }
                    index++;
                }
            }
            return [...parentPath, index];
        },
    },
});

</script>
