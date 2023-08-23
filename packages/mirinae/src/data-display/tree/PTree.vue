<template>
    <tree ref="treeRef"
          :value="treeData"
          :indent="16"
          class="p-tree"
          :draggable="!dragOptions.disabled"
          :each-draggable="eachDraggable"
          :each-droppable="eachDroppable"
          :ondragstart="onDragStart"
          :ondragend="onDragEnd"
          :unfold-when-dragover="true"
          :selected-paths="selectedPaths"
          @drop="handleDrop"
    >
        <template #default="{node, path}">
            <div class="node"
                 :class="{
                     'drag-target-parent': dragTargetParentPath ? dragTargetParentPath.toString() === path.toString() : false,
                     ...getClassNames(node)
                 }"
                 @click.stop="onClickNode(node, path, $event)"
                 @keypress.enter="onClickNode(node, path, $event)"
            >
                <slot name="node"
                      v-bind="{node, path, selected: getSelectState(path)}"
                >
                    <span v-if="$scopedSlots[`left-extra`]"
                          class="left-extra"
                    >
                        <slot name="left-extra"
                              v-bind="{node, path, selected: getSelectState(path)}"
                        />
                    </span>
                    <span v-if="!toggleOptions.disabled || $scopedSlots[`toggle`]"
                          class="toggle"
                          @click.stop="onToggle(node, path)"
                    >
                        <slot name="toggle"
                              v-bind="{node, path, selected: getSelectState(path)}"
                        >
                            <p-spinner v-if="node.loading"
                                       size="sm"
                            />
                            <p-i v-else-if="!toggleOptions.validator || (toggleOptions.validator && toggleOptions.validator(node))"
                                 :name="node.$folded ? 'ic_caret-right' : 'ic_caret-down-filled-alt'"
                                 width="1em"
                                 height="1em"
                                 color="inherit"
                            />
                        </slot>
                    </span>
                    <p-text-input v-if="isEditing && getSelectState(path)"
                                  v-model="editText"
                                  :is-focused="isEditing && getSelectState(path)"
                                  :invalid="invalid"
                                  @blur="finishEdit(node)"
                                  @keydown.enter="finishEdit(node)"
                    />
                    <template v-else>
                        <span v-if="$scopedSlots[`toggle-right`]"
                              class="toggle-right"
                        >
                            <slot name="toggle-right"
                                  v-bind="{node, path, selected: getSelectState(path)}"
                            />
                        </span>
                        <span v-if="$scopedSlots[`icon`]"
                              class="icon"
                        >
                            <slot name="icon"
                                  v-bind="{node, path, selected: getSelectState(path)}"
                            />
                        </span>
                        <span class="data">
                            <slot name="data"
                                  v-bind="{node, path, selected: getSelectState(path)}"
                            >
                                {{ dataGetter(node) }}
                            </slot>
                        </span>
                        <span v-if="$scopedSlots[`right-extra`]"
                              class="right-extra"
                        >
                            <slot name="right-extra"
                                  v-bind="{node, path, selected: getSelectState(path)}"
                            />
                        </span>
                    </template>
                </slot>
            </div>
        </template>
    </tree>
</template>

<script lang="ts">
/* eslint-disable no-await-in-loop */
import {
    defineComponent, computed, onMounted, reactive, toRefs, watch,
} from 'vue';

import { unionBy } from 'lodash';
import { focus } from 'vue-focus';

import type { Store } from '@/data-display/tree/he-tree-vue/libs/draggable/types';
import { getDefaultNode } from '@/data-display/tree/helper';
import type {
    Tree,
    TreeNode,
    Predicate,
    TreeItem,
    ToggleOptions,
    SelectOptions,
    EditOptions,
    DragOptions,
    DataGetter,
    DataSetter,
    GetClassNames, DataFetcher, CloneTreeDataOptions,
} from '@/data-display/tree/type';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import PI from '@/foundation/icons/PI.vue';
import PTextInput from '@/inputs/input/text-input/PTextInput.vue';

import OriginTree from './he-tree-vue/components/Tree.vue';
import type { WalkTreeDataCallback } from './he-tree-vue/tree-data';
import { walkTreeData, cloneTreeData } from './he-tree-vue/tree-data';


interface Props {
    toggleOptions: ToggleOptions;
    selectOptions: SelectOptions;
    editOptions: EditOptions;
    dragOptions: DragOptions;
    dataGetter: DataGetter;
    dataSetter: DataSetter;
    dataFetcher?: DataFetcher;
    fetchOnInit?: boolean;
    getClassNames: GetClassNames;
}



export default defineComponent<Props>({
    name: 'PTree',
    components: {
        PSpinner,
        PTextInput,
        PI,
        Tree: OriginTree,
    },
    directives: { focus },
    props: {
        toggleOptions: {
            type: Object,
            default: () => ({}),
        },
        selectOptions: {
            type: Object,
            default: () => ({}),
        },
        editOptions: {
            type: Object,
            default: () => ({}),
        },
        dragOptions: {
            type: Object,
            default: () => ({}),
        },
        dataGetter: {
            type: Function,
            default: (node) => node.data,
        },
        dataSetter: {
            type: Function,
            default: (d, node) => { node.data = d; },
        },
        dataFetcher: {
            type: Function,
            default: undefined,
        },
        fetchOnInit: {
            type: Boolean,
            default: false,
        },
        getClassNames: {
            type: Function,
            default: () => ({}),
        },
    },
    setup(props: Props, { emit }) {
        const state = reactive({
            treeRef: null as null|any,
            treeData: [] as TreeNode[],
            editText: '',
            isEditing: false,
            invalid: computed(() => {
                if (props.editOptions.validator) return !props.editOptions.validator(state.editText);
                return undefined;
            }),
            selectedItems: [] as TreeNode[],
            selectedPaths: computed<number[]>(() => state.selectedItems.map((d) => d.path)),
            isFetchAndFinding: false,
            dragTargetParentPath: null as null|number[],
        });
        //
        const getSelectState = (path: number[]) => !!state.selectedPaths.find((d) => d.toString() === path.toString());

        const resetSelect = () => {
            state.selectedItems = [];
        };

        const setSelectItem = (node: TreeNode, path, value = true) => {
            if (state.isFetchAndFinding) return;

            if (props.selectOptions.validator && !props.selectOptions.validator(node)) return;

            // multi select
            if (props.selectOptions.multiSelectable) {
                const idx = state.selectedItems.findIndex((d) => d.path.toString() === path.toString());
                if (idx === -1) {
                    if (value) {
                        state.selectedItems = [...state.selectedItems, { node, path }];
                    }
                } else {
                    state.selectedItems.splice(idx, 1);
                }
                return;
            }
            // single select
            if (value) {
                state.selectedItems = [{ node, path }];
            } else {
                resetSelect();
            }
        };
        const setSelectItems = (items: {node: any; path: number[]}[], value = true) => {
            if (state.isFetchAndFinding) return;

            let targetItems: {node: any; path: number[]}[];

            const validator = props.selectOptions.validator;
            if (validator) {
                targetItems = items.filter(({ node }) => validator(node));
            } else {
                targetItems = items;
            }

            // multi select
            if (props.selectOptions.multiSelectable) {
                if (!state.treeRef) return;

                targetItems = unionBy(state.selectedItems, targetItems, (d) => d.path.toString());
                if (value) {
                    state.selectedItems = targetItems;
                } else {
                    state.selectedItems = [];
                }

                return;
            }

            // single select
            if (value) {
                if (targetItems[0]) {
                    state.selectedItems = [targetItems[0]];
                }
            } else {
                resetSelect();
            }
        };

        const startEdit = (node: TreeNode) => {
            if (props.editOptions.disabled) return;
            const validator = props.editOptions.editStartValidator;
            if (validator && !validator(node)) return;
            state.editText = props.dataGetter(node);
            state.isEditing = true;
        };

        const changeSelectState = (node: TreeNode, path: number[], value = true): void => {
            if (props.selectOptions.disabled) return;
            setSelectItem(node, path, value);
        };

        const onDragStart = (e: Store) => {
            const validator = props.dragOptions.startValidator;
            const parent = e.startPath ? state.treeRef.getNodeParentByPath(e.startPath) as TreeNode : null;

            if (validator && !validator(e.dragNode as TreeNode, parent)) return false;

            emit('start-drag', e.dragNode, parent);
            return true;
        };

        const onDragEnd = (e: Store) => {
            state.dragTargetParentPath = null;
            const parent = e.targetPath ? state.treeRef.getNodeParentByPath(e.targetPath) as TreeNode : null;
            const oldParent = e.startPath ? state.treeRef.getNodeParentByPath(e.startPath) as TreeNode : null;

            const validator = props.dragOptions.endValidator;

            if (validator && !validator(e.dragNode as TreeNode, oldParent, parent)) {
                emit('end-drag', e.dragNode, oldParent, parent);
                return false;
            }

            emit('end-drag', e.dragNode, oldParent, parent);
            return true;
        };

        const handleDrop = (e: Store, targetPath, _rollback) => {
            const rollback = () => {
                _rollback();

                if (getSelectState(targetPath ?? [])) {
                    setSelectItem(e.dragNode as TreeNode, e.startPath);
                }
            };

            if (getSelectState(e.startPath ?? [])) {
                setSelectItem(e.dragNode as TreeNode, targetPath);
            }

            let oldParent: TreeNode|null = null;
            if (e.startPath) {
                try {
                    oldParent = state.treeRef.getNodeParentByPath(e.startPath) as TreeNode;
                } catch (error) {}
            }

            const parent = state.treeRef.getNodeParentByPath(targetPath) as TreeNode;

            emit('drop', e.dragNode, oldParent, parent, rollback);
        };

        const eachDraggable = (path: number[], e: Store) => {
            const dragValidator = props.dragOptions.dragValidator;
            if (dragValidator
                && !dragValidator(e.dragNode as TreeNode, path ? state.treeRef.getNodeParentByPath(path) as TreeNode : undefined)) {
                return false;
            }
            return true;
        };
        const eachDroppable = (parentPath: number[], e: Store) => {
            const dropValidator = props.dragOptions.dropValidator;

            let parent: null|TreeNode = null;
            if (parentPath.length > 0) {
                parent = state.treeRef.getNodeByPath(parentPath) as TreeNode;
            }

            const oldParent = e.startPath ? state.treeRef.getNodeParentByPath(e.startPath) : null;

            state.dragTargetParentPath = parentPath;

            if (dropValidator && !dropValidator(e.dragNode as TreeNode, oldParent as TreeNode, parent)) return false;
            return true;
        };
        const finishEdit = (node: TreeNode) => {
            if (!state.isEditing) return;

            state.isEditing = false;
            if (state.invalid) return;

            if (props.editOptions?.setDataAfterEdit) {
                props.dataSetter(state.editText, node);
            }

            emit('finish-edit', node, state.editText);
        };

        const fetchData = async (_node?: TreeNode|null): Promise<TreeNode[]> => {
            if (!props.dataFetcher) return [];

            const node: Partial<TreeNode> = _node || {};

            node.loading = true;
            let res = props.dataFetcher(node);
            if (res instanceof Promise) res = await res;
            node.children = res.map(getDefaultNode);
            node.loading = false;

            if (!_node) state.treeData = node.children;

            return node.children;
        };

        const onNodeFoldedChange = async (node: TreeNode, path: number[], folded?: boolean) => {
            if (folded) {
                if (props.toggleOptions.removeChildrenOnFold) {
                    node.children = [];

                    if (props.dataFetcher) {
                        state.selectedItems = state.selectedItems.filter(({ path: selectedPath }) => {
                            const isChildOfToggledNode = selectedPath.length > path.length && path.every((d, i) => selectedPath[i] === d);
                            return !isChildOfToggledNode;
                        });
                    }
                }
            } else if (props.toggleOptions.removeChildrenOnFold || !node.children.length) {
                await fetchData(node);
            }
        };

        const onToggle = async (node: TreeNode, path: number[]) => {
            if (props.toggleOptions.disabled) return;
            if (props.toggleOptions.validator && !props.toggleOptions.validator(node)) return;

            if (node.$folded) {
                if (state.treeRef) state.treeRef.unfold(node, path);
            } else if (state.treeRef) state.treeRef.fold(node, path);
            await onNodeFoldedChange(node, path, node.$folded);
        };

        const onClickNode = (node: TreeNode, path: number[], e: Store) => {
            emit('click-node', node, path, e);

            if (getSelectState(path)) startEdit(node);
            else changeSelectState(node, path);

            if (props.toggleOptions.toggleOnNodeClick) onToggle(node, path);
        };

        const addNode = (data: any[]|any): void => {
            if (Array.isArray(data)) state.treeData = state.treeData.concat(data.map((d) => getDefaultNode(d)));
            else state.treeData.push(getDefaultNode(data));
        };
        const findNodePath = (predicate: Predicate, paths: number[] = [], _children?: any[]): number[] => {
            let children: any[] = _children as unknown as any[];
            if (!children) children = state.treeData;

            for (let i = 0; i < children.length; i++) {
                const current = children[i];
                if (predicate(current.data)) {
                    paths.push(i);
                    return paths;
                }

                if (current?.children) {
                    const res = findNodePath(predicate, [...paths, i], current.children);
                    if (res.length) return res;
                }
            }

            return [];
        };
        const findNode = (predicate: Predicate): null|TreeNode => {
            const path = findNodePath(predicate);
            let node: null|TreeNode = null;
            if (state.treeRef) node = state.treeRef.getNodeByPath(path);

            if (node) {
                setSelectItem(node, path);
                return node;
            }
            resetSelect();
            return null;
        };
        const fetchAndFind = async (predicates: Predicate[]): Promise<{node: TreeNode|null; path: number[]}> => {
            let node: TreeNode|null = null;
            const path: number[] = [];

            for (let i = 0; i < predicates.length; i++) {
                const predicate = predicates[i];
                let children: TreeNode[] = node?.children || state.treeData;

                let idx: number = children.findIndex((d) => predicate(d.data));

                if (idx === -1) {
                    await fetchData(node);
                    children = node?.children || state.treeData;
                    idx = children.findIndex((d) => predicate(d.data));
                    if (idx === -1) {
                        state.isFetchAndFinding = false;
                        return { node: null, path: [] };
                    }
                }

                node = children[idx];
                path.push(idx);

                if (i < predicates.length - 1) {
                    node.$folded = false;
                }
            }

            return { node, path };
        };
        const fetchAndFindNode = async (predicates: Predicate[]): Promise<{node: TreeNode|null; path: number[]}> => {
            state.isFetchAndFinding = true;

            const { node, path } = await fetchAndFind(predicates);

            if (node) {
                state.isFetchAndFinding = false;
                setSelectItem(node, path);
            }
            return { node, path };
        };
        const fetchAndFindNodes = async (predicateList: Predicate[][]): Promise<{node: TreeNode; path: number[]}[]> => {
            state.isFetchAndFinding = true;

            const foundItems: {node: any; path: number[]}[] = [];

            for (let i = 0; i < predicateList.length; i++) {
                const predicates = predicateList[i];
                const { node, path } = await fetchAndFind(predicates);
                if (node) {
                    foundItems.push({ node, path });
                }
            }

            state.isFetchAndFinding = false;
            setSelectItems(foundItems);
            return foundItems;
        };
        const getAllNodes = (_node?: TreeNode|null): TreeNode[] => {
            if (!state.treeRef) return [];

            const items: TreeNode[] = [];
            walkTreeData(_node?.children || state.treeData, (node) => {
                items.push(node as TreeNode);
            });
            return items;
        };

        const getAllItems = (_node?: TreeNode|null): TreeItem[] => {
            if (!state.treeRef) return [];

            const items: TreeItem[] = [];
            walkTreeData(_node?.children || state.treeData, (node, index, parent, path) => {
                items.push({ node: node as TreeNode, path });
            });
            return items;
        };

        const deleteNodeByPath = (path: number[]): void => {
            if (path.length === 0) return;

            if (getSelectState(path)) resetSelect();
            state.treeRef.removeNodeByPath(path);
        };

        const deleteNode = (predicate: Predicate): void => {
            const path = findNodePath(predicate);
            deleteNodeByPath(path);
        };

        const addChildNodeByPath = (path: number[], data: any[]|any, unfold = true): void => {
            if (path.length === 0) addNode(data);
            else {
                const parent = state.treeRef.getNodeByPath(path) as TreeNode || null;
                if (parent) {
                    if (Array.isArray(data)) {
                        parent.children = parent.children.concat(data.map((d) => getDefaultNode(d)));
                    } else {
                        parent.children = [...parent.children, getDefaultNode(data)];
                    }
                    if (unfold) parent.$folded = false;
                } else {
                    addNode(data);
                }
            }
        };

        const updateNodeByPath = (path: number[], data): void => {
            if (path.length === 0) return;

            const target = state.treeRef.getNodeByPath(path);
            if (!target) return;
            target.data = data;
        };

        const updateNode = (predicate: Predicate, data): void => {
            const path = findNodePath(predicate);
            updateNodeByPath(path, data);
        };

        watch(() => state.selectedPaths, (after, before) => {
            if (after.toString() === before.toString()) return;
            emit('change-select', state.selectedItems);
        });


        /* Init */
        const root: Tree = {
            fetchData,
            changeSelectState,
            addNode,
            findNode,
            fetchAndFindNode,
            fetchAndFindNodes,
            resetSelect,
            getAllNodes,
            getAllItems,
            deleteNodeByPath,
            deleteNode,
            addChildNodeByPath,
            updateNodeByPath,
            updateNode,
            toggleNode: (node: TreeNode, path: number[]) => {
                (async () => {
                    await onToggle(node, path);
                })();
            },
            getNodeParentByPath(path: number[]) {
                return state.treeRef?.getNodeParentByPath(path) || null;
            },
            getNodeByPath(path: number[]) {
                return state.treeRef?.getNodeByPath(path) || null;
            },
            walkTreeData(treeData: TreeNode[]|null, handler: WalkTreeDataCallback, options?: {reverse: boolean}) {
                if (!state.treeRef) return;

                walkTreeData(treeData === null ? state.treeData : treeData, handler, options);
            },
            cloneTreeData(treeData: TreeNode[]|null, options: CloneTreeDataOptions): TreeNode[] {
                if (!state.treeRef) return [];

                return cloneTreeData(treeData === null ? state.treeData : treeData, options) as TreeNode[];
            },
            fold(node: TreeNode) {
                if (!state.treeRef) return;
                state.treeRef.fold(node);
            },
            unfold(node: TreeNode) {
                if (!state.treeRef) return;
                state.treeRef.unfold(node);
            },
        };

        onMounted(() => {
            (async () => {
                if (props.fetchOnInit) {
                    await fetchData();
                }
                emit('init', root);
            })();
        });


        return {
            ...toRefs(state),
            getSelectState,
            onClickNode,
            changeSelectState,
            eachDraggable,
            eachDroppable,
            onDragStart,
            onDragEnd,
            handleDrop,
            finishEdit,
            onToggle,
        };
    },
});
</script>

<style lang="postcss">
.p-tree {
    @apply w-full;

    .tree-branch {
        &.tree-placeholder {
            .tree-node-back .tree-node {
                @apply border border-secondary;
            }
        }
    }
    .he-tree--hidden {
        display: none;
    }
    .he-tree--rtl {
        direction: rtl;
    }
    .tree-node-back {
        @apply rounded;

        @media (hover: hover) {
            &:hover {
                @apply text-secondary bg-secondary2;
            }
        }
        &.selected {
            @apply bg-blue-200;
        }
    }
    .tree-node {
        @apply h-8 text-sm text-black cursor-pointer rounded;
        .node {
            @apply h-full w-full inline-flex items-center;
            line-height: 0;
            &.drag-target-parent {
                @apply bg-secondary text-white rounded;
            }
        }
        .toggle {
            @apply cursor-pointer;
            color: inherit;
            width: 1rem;
            font-size: 1rem;
            flex-shrink: 0;
        }
        .icon {
            @apply flex-shrink-0 flex-grow-0;
        }
        .data {
            @apply leading-normal truncate;
        }
        .p-text-input {
            @apply ml-1 w-full;
        }
        .right-extra {
            @apply flex-grow;
        }
    }
}
</style>
