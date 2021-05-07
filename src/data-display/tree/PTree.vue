<template>
    <tree ref="treeRef" :value="treeData"
          :indent="16"
          class="p-tree"
          :draggable="!dragOptions.disabled"
          :each-draggable="eachDraggable"
          :each-droppable="eachDroppable"
          :ondragstart="onDragStart"
          :ondragend="onDragEnd"
          :unfold-when-dragover="true"
          @node-folded-changed="onNodeFoldedChange"
    >
        <template #default="{node, path, tree, index}">
            <div class="node" :class="{
                     selected: getSelectState(path),
                     ...getClassNames(node)
                 }"
                 @click.stop="changeSelectState(node, path)"
            >
                <slot name="node" v-bind="{node, path, selected: getSelectState(path)}">
                    <span v-if="$scopedSlots[`left-extra`]" class="left-extra">
                        <slot name="left-extra" v-bind="{node, path, selected: getSelectState(path)}" />
                    </span>
                    <span v-if="!toggleOptions.disabled || $scopedSlots[`toggle`]" class="toggle"
                          @click.stop="onToggle(node, path, tree)"
                    >
                        <slot name="toggle" v-bind="{node, path, selected: getSelectState(path)}">
                            <p-i v-if="node.loading" name="ic_working"
                                 width="1rem" height="1rem"
                            />
                            <template v-else>
                                <p-i v-if="toggleOptions.validator && toggleOptions.validator(node)"
                                     :name="node.$folded ? 'ic_tree_arrow' : 'ic_tree_arrow--opened'"
                                     width="1em" height="1em"
                                     color="inherit transparent"
                                />
                            </template>
                        </slot>
                    </span>
                    <p-text-input v-if="isEditing && path.toString() === selectedPath.toString()"
                                  v-model="editText" v-focus="true"
                                  :invalid="invalid"
                                  @blur="finishEdit(node)"
                                  @keydown.enter="finishEdit(node)"
                    />
                    <template v-else>
                        <span v-if="$scopedSlots[`toggle-right`]" class="toggle-right">
                            <slot name="toggle-right" v-bind="{node, path, selected: getSelectState(path)}" />
                        </span>
                        <span v-if="$scopedSlots[`icon`]" class="icon">
                            <slot name="icon" v-bind="{node, path, selected: getSelectState(path)}" />
                        </span>
                        <span class="data">
                            <slot name="data" v-bind="{node, path, tree, selected: getSelectState(path)}">
                                {{ dataGetter(node) }}
                            </slot>
                        </span>
                        <span v-if="$scopedSlots[`right-extra`]" class="right-extra">
                            <slot name="right-extra" v-bind="{node, path, selected: getSelectState(path)}" />
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
    Tree, Fold, Draggable,
} from 'he-tree-vue';
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import PTextInput from '@/inputs/input/PTextInput.vue';
import { focus } from 'vue-focus';

export default defineComponent({
    name: 'PTree',
    components: {
        PTextInput,
        PI,
        Tree: ((Tree as any).mixPlugins([Fold, Draggable]) as any),
    },
    directives: { focus },
    props: {
        toggleOptions: {
            type: Object,
            default: () => ({
                disabled: false,
                validator: () => true,
            }),
        },
        selectOptions: {
            type: Object,
            default: () => ({
                disabled: false,
                validator: () => true,
            }),
        },
        editOptions: {
            type: Object,
            default: () => ({
                disabled: false,
                editStartValidator: () => true,
                validator: () => true,
            }),
        },
        dragOptions: {
            type: Object,
            default: () => ({
                disabled: false,
                dragValidator: () => true,
                dropValidator: () => true,
            }),
        },
        dataGetter: {
            type: Function,
            default: node => node.data,
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
            default: true,
        },
        getClassNames: {
            type: Function,
            default: () => ({}),
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            treeRef: undefined as any,
            treeData: [],
            editText: '',
            isEditing: false,
            invalid: computed(() => {
                if (props.editOptions.validator) return !props.editOptions.validator(state.editText);
                return undefined;
            }),
            selectedItem: {} as { path?: number[]; node?: any},
            selectedPath: computed(() => state.selectedItem.path || []),
            selectedNode: computed(() => state.selectedItem.node || null),
            isFetchAndFinding: false,
        });

        const getSelectState = path => state.selectedPath.toString() === path.toString();

        const resetSelect = () => {
            state.selectedItem = {};
        };

        const setSelectItem = (node, path) => {
            if (state.isFetchAndFinding) return;

            if (props.selectOptions.validator) {
                if (!props.selectOptions.validator(node)) return;
            }
            state.selectedItem = { node, path };
        };

        const startEdit = (node) => {
            if (props.editOptions.disabled) return;
            const validator = props.editOptions.editStartValidator;
            if (validator && !validator(node)) return;
            state.editText = props.dataGetter(node);
            state.isEditing = true;
        };

        const changeSelectState = (node, path) => {
            if (props.selectOptions.disabled) return;

            if (state.selectedNode) {
                if (state.selectedPath.toString() === path.toString()) {
                    startEdit(state.selectedNode);
                    return;
                }
            }
            setSelectItem(node, path);
        };

        const onDragStart = (tree, e) => {
            const validator = props.dragOptions.startValidator;
            const parent = tree.getNodeParentByPath(e.startPath);

            if (validator && !validator(e.dragNode, parent)) return false;

            emit('start-drag', e.dragNode, parent);
            return true;
        };

        const onDragEnd = (tree, e) => {
            const parent = tree.getNodeParentByPath(e.targetPath);

            const validator = props.dragOptions.endValidator;

            if (validator && !validator(e.dragNode, parent)) {
                emit('end-drag', e.dragNode, parent);
                return false;
            }

            if (state.selectedNode && e.startPath.toString() === state.selectedPath.toString()) {
                setSelectItem(e.dragNode, e.targetPath);
            }

            emit('update-drag', e.dragNode, parent);
            emit('end-drag', e.dragNode, parent);
            return true;
        };

        const eachDraggable = (path, tree, e) => {
            const dragValidator = props.dragOptions.dragValidator;
            if (dragValidator && !dragValidator(e.dragNode, tree.getNodeParentByPath(path))) return false;
            return true;
        };
        const eachDroppable = (parentPath, tree, e) => {
            const dropValidator = props.dragOptions.dropValidator;

            let parent = null;
            if (parentPath.length > 0) {
                parent = tree.getNodeByPath(parentPath);
            }

            if (dropValidator && !dropValidator(e.dragNode, parent)) return false;
            return true;
        };
        const finishEdit = (node) => {
            if (!state.isEditing) return;

            state.isEditing = false;
            if (state.invalid) return;

            props.dataSetter(state.editText, node);

            emit('finish-edit', node);
        };
        const getDefaultNode = data => ({
            data,
            children: [],
            $folded: true,
            loading: false,
        });
        const fetchData = async (_node?) => {
            if (!props.dataFetcher) return [];

            const node = _node || {};

            node.loading = true;
            let res = props.dataFetcher(node);
            if (res instanceof Promise) res = await res;
            node.children = res.map(getDefaultNode);
            node.loading = false;

            if (!_node) state.treeData = node.children;

            return node.children;
        };
        const onToggle = async (node, path, tree) => {
            if (node.$folded) {
                tree.unfold(node, path);
            } else {
                tree.fold(node, path);
            }
        };
        const onNodeFoldedChange = async (node, path) => {
            if (node.$folded) {
                if (props.dataFetcher) {
                    node.children = [];
                    if (state.selectedNode && path.every((d, i) => state.selectedPath[i] === d)) {
                        if (state.selectedPath.toString() !== path.toString()) resetSelect();
                    }
                }
            } else {
                await fetchData(node);
            }
        };
        const addNode = (data) => {
            if (Array.isArray(data)) state.treeData = state.treeData.concat(data.map(d => getDefaultNode(d)));
            else state.treeData.push(getDefaultNode(data));
        };
        const findNodePath = (predicate: any, paths: number[] = [], _children?: any[]) => {
            let children: any[] = _children as unknown as any[];
            if (!children) children = state.treeData;

            for (let i = 0; i < children.length; i++) {
                const current = children[i];
                if (predicate(current.data)) {
                    paths.push(i);
                    return paths;
                }

                if (current.children) {
                    const res = findNodePath(predicate, [...paths, i], current.children);
                    if (res.length) return res;
                }
            }

            return [];
        };
        const findNode = (predicate) => {
            const path = findNodePath(predicate);
            let node = null;
            if (state.treeRef) node = state.treeRef.getNodeByPath(path);

            if (node) {
                setSelectItem(node, path);
                return node;
            }
            resetSelect();
            return null;
        };
        const fetchAndFindNode = async (predicates: any[]) => {
            state.isFetchAndFinding = true;
            let node: any = null;
            const path: number[] = [];

            for (let i = 0; i < predicates.length; i++) {
                const predicate = predicates[i];
                let children: any[] = node?.children || state.treeData;

                let idx: number = children.findIndex(d => predicate(d.data));

                if (idx === -1) {
                    await fetchData(node);
                    children = node?.children || state.treeData;
                    idx = children.findIndex(d => predicate(d.data));
                    if (idx === -1) {
                        state.isFetchAndFinding = false;
                        return null;
                    }
                }

                node = children[idx] as any;
                path.push(idx);

                if (i < predicates.length - 1) {
                    node.$folded = false;
                }
            }

            if (node) {
                state.isFetchAndFinding = false;
                setSelectItem(node, path);
            }
            return node;
        };
        const getAllNodes = (node, nodes: any[] = []) => {
            const children: any[] = node?.children || state.treeData;
            children.forEach((d) => {
                nodes.push(d);
                if (d.children && d.children.length) getAllNodes(d, nodes);
            });
            return nodes;
        };

        const getAllItems = (node, _path: number[] = []) => {
            const children: any[] = node?.children || state.treeData;
            let items: any[] = [];

            children.forEach((d, i) => {
                const path = [..._path];
                path.push(i);

                const data: any = {};
                data.path = path;
                data.node = d;
                items.push(data);
                if (d.children && d.children.length) {
                    items = items.concat(getAllItems(d, path));
                }
            });
            return items;
        };

        const deleteNodeByPath = (path) => {
            if (path.length === 0) return;

            if (state.selectedPath.toString() === path.toString()) resetSelect();
            state.treeRef.removeNodeByPath(path);
        };

        const deleteNode = (predicate) => {
            const path = findNodePath(predicate);
            deleteNodeByPath(path);
        };

        const addChildNodeByPath = (path, data, unfold = true) => {
            if (path.length === 0) addNode(data);
            else {
                const parent = state.treeRef.getNodeByPath(path);
                if (parent) {
                    if (Array.isArray(data)) {
                        parent.children = parent.children.concat(data.map(d => getDefaultNode(d)));
                    } else {
                        parent.children.push(getDefaultNode(data));
                    }
                    if (unfold) parent.$folded = false;
                } else {
                    addNode(data);
                }
            }
        };

        const updateNodeByPath = (path, data) => {
            if (path.length === 0) return;

            const target = state.treeRef.getNodeByPath(path);
            if (!target) return;

            target.data = data;
        };

        const updateNode = (predicate, data) => {
            const path = findNodePath(predicate);
            updateNodeByPath(path, data);
        };

        const root = {
            fetchData,
            addNode,
            findNode,
            fetchAndFindNode,
            resetSelect,
            getAllNodes,
            getAllItems,
            deleteNodeByPath,
            deleteNode,
            addChildNodeByPath,
            updateNodeByPath,
            updateNode,
            changeSelectState,
        };


        watch(() => state.selectedPath, (path, before) => {
            if (path.toString() === before.toString()) return;
            emit('change-select', state.selectedNode, path);
        });


        /* Init */
        (async () => {
            if (props.fetchOnInit) {
                await fetchData();
            }
            emit('init', root);
        })();

        return {
            ...toRefs(state),
            getSelectState,
            changeSelectState,
            eachDraggable,
            eachDroppable,
            onDragStart,
            onDragEnd,
            finishEdit,
            onToggle,
            onNodeFoldedChange,
        };
    },
});
</script>

<style lang="postcss">
.p-tree {
    @apply w-full;

    .tree-children.tree-root {}
    .tree-branch {
        &.tree-placeholder {
            .tree-node-back .tree-node {
                @apply border border-gray-900;
            }
        }
    }
    .tree-node-back {
        &:hover {
            @apply text-secondary bg-secondary2;
        }
        .tree-node .node.selected {
            @apply bg-blue-200;
        }
    }
    .tree-node {
        @apply h-8 rounded-sm text-sm text-black cursor-pointer;
        .node {
            @apply h-full w-full inline-flex items-center;
        }
        .toggle {
            @apply cursor-pointer;
            color: inherit;
            width: 1rem;
            font-size: 1rem;
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
