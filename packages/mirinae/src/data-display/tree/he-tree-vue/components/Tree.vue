<template>
    <div ref="treeRef"
         class="he-tree"
         :class="{'he-tree--rtl': props.rtl}"
         :data-tree-id="state.treeId"
    >
        <children-list :nodes="state.rootNode.children"
                       :indent="props.indent"
                       :parent="state.rootNode"
                       :parent-path="[]"
                       :root-node="state.rootNode"
                       :rtl="props.rtl"
                       :selected-paths="props.selectedPaths"
        >
            <template #default="scope">
                <slot v-bind="scope" />
            </template>
        </children-list>
    </div>
</template>

<script setup lang="ts">
import {
    reactive, toRefs,
    computed, watch, ref, onMounted,
    onBeforeMount, onBeforeUnmount, defineExpose, getCurrentInstance, toRef,
} from 'vue';

import type { Store } from '@/data-display/tree/he-tree-vue/plugins/draggable/draggable-types';
import { useDraggable } from '@/data-display/tree/he-tree-vue/plugins/draggable/use-draggable';
import { useFold } from '@/data-display/tree/he-tree-vue/plugins/use-fold';
import { TreeData } from '@/data-display/tree/he-tree-vue/tree-data';
import type { TreeDataPath } from '@/data-display/tree/he-tree-vue/types';

import {
    arrayRemove,
    joinFunctionsByNext,
    randString,
} from '../helpers';
import * as ut from '../utils';

interface Func {(...args: any[]): any}

const ChildrenList = () => ({
    component: import('./ChildrenList.vue') as any,
});

interface Props {
    value?: any[];
    indent?: number;
    rtl?: boolean;
    selectedPaths?: number[];
    // draggable
    triggerClass?: string;
    triggerBySelf?: boolean;
    draggable?: boolean;
    droppable?: boolean;
    eachDraggable?: (path: number[], e: Store) => boolean;
    eachDroppable?: (path: number[], e: Store) => boolean;
    ondragstart?: (e: Store) => boolean;
    ondragend?: (e: Store) => boolean;
    unfoldWhenDragover?: boolean;
    unfoldWhenDragoverDelay?: number;
    draggingNodePositionMode?: string; // 'top_left_corner'|'top_left_corner'|'mouse';
    edgeScroll?: boolean;
    edgeScrollTriggerMargin?: number,
    edgeScrollSpeed?: number,
    edgeScrollTriggerMode?: string;
    edgeScrollSpecifiedContainerX?: HTMLElement|((store) => HTMLElement);
    edgeScrollSpecifiedContainerY?: HTMLElement|((store) => HTMLElement);
    preventTextSelection?: boolean;
    // fold
    foldingTransitionNames?: string;
    foldingTransition?: boolean;
    foldAllAfterMounted?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    value: () => [],
    indent: 20,
    rtl: false,
    selectedPaths: () => [],
    // draggable
    triggerClass: 'tree-node',
    triggerBySelf: undefined,
    draggable: true,
    droppable: true,
    eachDraggable: undefined,
    eachDroppable: undefined,
    ondragstart: undefined,
    ondragend: undefined,
    unfoldWhenDragover: true,
    unfoldWhenDragoverDelay: 30,
    draggingNodePositionMode: 'top_left_corner',
    edgeScroll: undefined,
    edgeScrollTriggerMargin: 50,
    edgeScrollSpeed: 0.35,
    edgeScrollTriggerMode: 'top_left_corner',
    edgeScrollSpecifiedContainerX: undefined,
    edgeScrollSpecifiedContainerY: undefined,
    preventTextSelection: true,
    // fold
    foldingTransitionNames: undefined,
    foldingTransition: undefined,
    foldAllAfterMounted: undefined,
});

const emit = defineEmits<{(event: 'input', value: any[]): void;
    (event: 'update:value', value: any[]): void;
    (event: 'update:root-node', value: any[]): void;
}>();

const vm = getCurrentInstance().proxy;

const state = reactive({
    rootNode: {} as any,
    trees: {},
    treeClass: '',
    treeId: randString(),
    _hooks: {} as Record<string, {(...args: any[]): any}[]>,
    proxyValue: [] as any[],
    treeData: computed({
        get() {
            return state.proxyValue;
        },
        set(value) {
            emit('update:value', value);
            emit('input', value);
            state.proxyValue = value;
        },
    }),
});


watch(() => props.value, (value) => {
    state.proxyValue = value;
}, { immediate: true });

const treeRef = ref<HTMLElement|null>(null);

let treeDataHelper: TreeData<any>;

watch(() => state.treeData, (treeData) => {
    treeDataHelper = new TreeData(treeData);
}, { immediate: true });

// get hooks in state._hooks, without which in props
const _getNonPropHooksByName = (name: string) => {
    if (state._hooks) {
        return state._hooks[name];
    }
    return null;
};

const addHook = (name: string, func: Func) => {
    if (!_getNonPropHooksByName(name)) {
        if (!state._hooks) {
            state._hooks = {};
        }
        if (!state._hooks[name]) {
            state._hooks[name] = [];
        }
    }
    state._hooks[name].push(func);
};

const removeHook = (name: string, func: Func) => {
    const hooks = _getNonPropHooksByName(name);
    if (hooks) {
        arrayRemove(hooks, func);
    }
};

const hasHook = (name: string) => _getNonPropHooksByName(name) || allMethods[name];

const executeHook = (name: string, hookArgs: any[]) => {
    let hooks = _getNonPropHooksByName(name);
    hooks = hooks ? hooks.slice() : [];
    const func = allMethods[name];
    if (func && typeof func === 'function') {
        hooks.push((next, ...args) => func(...args));
    }
    return joinFunctionsByNext(hooks)(...hookArgs);
};

const iteratePath = (path: TreeDataPath, opt) => treeDataHelper.iteratePath(path, opt);

const getTreeVmByTreeEl = (treeEl: HTMLElement) => state.trees[treeEl.getAttribute('data-tree-id') ?? ''];

const getAllNodesByPath = (path: TreeDataPath) => treeDataHelper.getAllNodes(path);

const getNodeByPath = (path: TreeDataPath) => treeDataHelper.getNode(path);

const getPathByBranchEl = (branchEl: HTMLElement): number[] => {
    const nodePath = branchEl.getAttribute('data-tree-node-path');
    if (nodePath) {
        return nodePath.split(',').map((v) => parseInt(v));
    }
    return [];
};

const getBranchElByPath = (path: TreeDataPath): Element|null => {
    if (treeRef.value) {
        return treeRef.value.querySelector(`[data-tree-node-path='${path.join(',')}']`);
    }
    return null;
};

const getNodeByBranchEl = (branchEl: HTMLElement) => getNodeByPath(getPathByBranchEl(branchEl));

const getNodeParentByPath = (path: TreeDataPath) => treeDataHelper.getNodeParent(path);

const removeNodeByPath = (path: TreeDataPath) => treeDataHelper.removeNode(path);
const walkTreeData = (handler, opt) => ut.walkTreeData(state.treeData, handler, opt);
const cloneTreeData = (opt) => ut.cloneTreeData(state.treeData, opt);
// return cloned new tree data without property witch starts with `$`
const getPureTreeData = () => ut.getPureTreeData(state.treeData);

const methods = {
    addHook,
    removeHook,
    hasHook,
    executeHook,
    iteratePath,
    getTreeVmByTreeEl,
    getAllNodesByPath,
    getNodeByPath,
    getPathByBranchEl,
    getBranchElByPath,
    getNodeByBranchEl,
    getNodeParentByPath,
    removeNodeByPath,
    walkTreeData,
    cloneTreeData,
    getPureTreeData,
};

onBeforeMount(() => {
    const updateRootNode = () => {
        state.rootNode.children = state.treeData;
        emit('update:root-node', state.rootNode);
    };
    watch(() => state.rootNode, updateRootNode, { immediate: true });
    watch(() => state.treeData, updateRootNode, { immediate: true });
});

onMounted(() => {
    state.treeId = randString();
    state.trees[state.treeId] = vm;
});

onBeforeUnmount(() => {
    delete state.trees[state.treeId];
});

const { treesStore, methods: draggableMethods } = useDraggable(props, emit, {
    treeRef,
    rootNodeRef: toRef(state, 'rootNode'),
    getTreeVmByTreeEl,
    getAllNodesByPath,
});

const { methods: foldMethods } = useFold(props, emit, { walkTreeData });

const allMethods = {
    ...methods,
    // NOTE: some methods are override by draggableMethods, so put draggableMethods after methods
    ...draggableMethods,
    ...foldMethods,
};

defineExpose({
    ...toRefs(state),
    treesStore,
    ...allMethods,
});

</script>
