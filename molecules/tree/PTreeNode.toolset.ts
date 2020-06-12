/* eslint-disable @typescript-eslint/no-explicit-any,no-empty-function */
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    computed, reactive,
} from '@vue/composition-api';
import { findIndex } from 'lodash';

export interface TreeNodeStateType<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    level: number;
    padSize: string;
    toggleSize: string;
    disableToggle: boolean;
    classNames: ClassNamesType<T, S>;
}

export interface BaseNodeStateType {
    expanded: boolean;
    selected: boolean;
}

type ClassNamesType<T=any, S extends BaseNodeStateType = BaseNodeStateType> = (node: TreeNode<T, S>) => {[name: string]: boolean};

export interface TreeNodeProps<T=any, S extends BaseNodeStateType = BaseNodeStateType> extends TreeNodeStateType, TreeNodeSyncStateType<T, S> {}

export interface TreeNodeSyncStateType<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    data: T;
    children: TreeNodeProps<T, S>[] | boolean;
    state: S;
}

export const getBaseNodeState = (): BaseNodeStateType => ({ expanded: false, selected: false });

export interface InitTreeNodeProps<T, S extends BaseNodeStateType = BaseNodeStateType> {
    level?: number;
    padSize?: string;
    toggleSize?: string;
    disableToggle?: boolean;
    classNames?: ClassNamesType<T>;
    data?: T;
    children?: InitTreeNodeProps<T, S>[] | boolean;
    state?: S;
}

export const getDefaultNode = <T=any, S extends BaseNodeStateType = BaseNodeStateType>(data: T, init?: InitTreeNodeProps<T, S>): InitTreeNodeProps<T, S> => ({
    data,
    children: false,
    state: getBaseNodeState() as S,
    ...init,
});

export interface TreeNode<T=any, S extends BaseNodeStateType = BaseNodeStateType> extends TreeNodeProps {
    key: number;
    parent: TreeNode<T, S>|null;
    sync: TreeNodeSyncStateType<T, S>;
}

@StateToolSet<TreeNodeStateType>()
@SyncStateToolSet<TreeNodeSyncStateType>()
export class TreeNodeState<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData=any, initState extends TreeNodeStateType<data, state> = TreeNodeStateType<data, state>,
    initSyncData=any, initSyncState extends TreeNodeSyncStateType<data, state> = TreeNodeSyncStateType<data, state>,
    > {
    state: UnwrapRef<optionalType<initState, initData>>

    syncState: UnwrapRef<optionalType<initSyncState, initSyncData>>

    static initState(): TreeNodeStateType {
        return {
            level: 0,
            padSize: '1rem',
            toggleSize: '1rem',
            disableToggle: false,
            classNames: (node: TreeNode) => ({
                basic: true,
                ...node.state,
            }),
        };
    }

    static initSyncState(): TreeNodeSyncStateType {
        return {
            data: '',
            children: false,
            state: getBaseNodeState(),
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        this.state = initReactive(lazy, TreeNodeState.initState(), initData);
        this.syncState = initReactive(lazy, TreeNodeState.initSyncState(), initSyncData);
    }
}


export interface TreeNodeMetaState<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    nodes: InitTreeNodeProps<T, S>[];
    selectedNodes: TreeNode<T, S>[];
    firstSelectedNode: TreeNode<T, S>;
}

export type TreeNodeEventListener<T=any, S extends BaseNodeStateType = BaseNodeStateType>
    = (node: TreeNode<T, S>, matched: TreeNode<T, S>[], e: MouseEvent) => void;

export interface TreeNodeEventListeners<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    [eventName: string]: TreeNodeEventListener<T, S>;
}


@HelperToolSet()
export class TreeNodeToolSet<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData=any, initSyncData=any
    > extends TreeNodeState<data, state, initData, TreeNodeStateType<data, state>, initSyncData, TreeNodeSyncStateType<data, state>> {
    metaState: TreeNodeMetaState<data, state> = null as unknown as TreeNodeMetaState<data, state>;

    isMultiSelect = false;

    setSelectedNodes: (node: TreeNode<data, state>) => void = () => {};

    setNodeState: (node: TreeNode<data, state>, state: {[name: string]: boolean}) => void
        = (node: TreeNode<data, state>, state: {[name: string]: boolean}) => {
            node.sync.state = {
                ...node.sync.state,
                ...state,
            } as state;
        };

    deleteNode: (node: TreeNode<data, state>) => void
        = (node: TreeNode<data, state>) => {
            if (node.parent && Array.isArray(node.parent.sync.children)) {
                node.parent.sync.children.splice(node.key, 1);
            } else {
                this.metaState.nodes.splice(node.key, 1);
            }
        };

    addNode: (node: InitTreeNodeProps<data, state>, target?: TreeNode<data, state>|null) => void
        = (node: InitTreeNodeProps<data, state>, target?: TreeNode<data, state>|null) => {
            if (target && Array.isArray(target.sync.children)) {
                target.sync.children = [...target.sync.children, node] as TreeNodeProps<data, state>[];
            } else {
                this.metaState.nodes.push(node);
            }
        };

    static initToolSet(_this: TreeNodeToolSet<any, any>, isMultiSelect: boolean): void {
        _this.isMultiSelect = isMultiSelect;
        _this.metaState = reactive({
            nodes: [],
            selectedNodes: [],
            firstSelectedNode: computed(() => _this.metaState.selectedNodes[0]),
        });
        _this.setSelectedNodes = (node: TreeNode): void => {
            // TODO: multi select case
            // if (_this.isMultiSelect) {
            // const idx = findIndex(_this.metaState.selectedNodes, (d: TreeNode) => d.key === node.key && d.level === node.level);
            // if (idx === -1) _this.metaState.selectedNodes.push(node);
            // else _this.metaState.selectedNodes.splice(idx, 1);
            // }

            if (_this.metaState.firstSelectedNode) {
                _this.setNodeState(_this.metaState.firstSelectedNode, { selected: false });
                if (_this.metaState.firstSelectedNode.key === node.key && _this.metaState.firstSelectedNode.level === node.level) {
                    _this.metaState.selectedNodes = [];
                    return;
                }
            }
            _this.setNodeState(node, { selected: true });
            _this.metaState.selectedNodes = [node];
        };
    }

    constructor(initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData,
        isMultiSelect = false) {
        super(initData, initSyncData);
        TreeNodeToolSet.initToolSet(this, isMultiSelect);
    }
}


export const treeNodeProps = {
    level: {
        type: Number,
        default: 0,
    },
    padSize: {
        type: String,
        default: '1rem',
    },
    toggleSize: {
        type: String,
        default: '1rem',
    },
    disableToggle: {
        type: Boolean,
        default: false,
    },
    classNames: {
        type: Function,
        default: (node: TreeNode): ReturnType<ClassNamesType> => ({
            basic: true,
            ...node.state,
        }),
    },
    /**
     * sync
     */
    data: {
        type: [Array, Object, String, Number, Boolean],
        default: '',
        required: true,
    },
    /**
     * sync
     */
    children: {
        type: [Array, Boolean],
        default: false,
    },
    /**
     * sync
     */
    state: {
        type: Object,
        default: (): BaseNodeStateType => ({ expanded: false, selected: false }),
        validator(state): boolean {
            return state instanceof Object && state.expanded !== undefined;
        },
    },
};
