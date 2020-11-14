/* eslint-disable @typescript-eslint/no-explicit-any,no-empty-function */
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import {
    computed, reactive, UnwrapRef,
} from '@vue/composition-api';

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
    loading: boolean;
}

type ClassNamesType<T=any, S extends BaseNodeStateType = BaseNodeStateType> = (node: TreeItem<T, S>) => {[name: string]: boolean};

export interface TreeNodeProps<T=any, S extends BaseNodeStateType = BaseNodeStateType> extends TreeNodeStateType, TreeNode<T, S> {}

export interface TreeNode<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    data: T;
    children: TreeNode<T, S>[] | boolean;
    state: S;
}

export const getBaseNodeState = (): BaseNodeStateType => ({ expanded: false, selected: false, loading: false });

export interface InitTreeNode<T, S extends BaseNodeStateType = BaseNodeStateType> {
    data?: T;
    children?: TreeNodeProps<T, S>[] | boolean;
    state?: S;
}

export const getDefaultNode = <T=any, S extends BaseNodeStateType = BaseNodeStateType>(data: T, init?: InitTreeNode<T, S>): TreeNode<T, S> => ({
    data,
    children: false,
    state: getBaseNodeState() as S,
    ...init,
});

export const getTreeItem = <T=any, S extends BaseNodeStateType = BaseNodeStateType>(
    key: number, level: number, node: TreeNode<T, S>, parent: TreeItem<T, S>|null = null): TreeItem<T, S> => ({
        key,
        level,
        node,
        parent,
    });

export interface TreeItem<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    key: number;
    level: number;
    parent: TreeItem<T, S>|null;
    node: TreeNode<T, S>;
    el?: HTMLElement;
}

@StateToolSet<TreeNodeStateType>()
@SyncStateToolSet<TreeNode>()
export class TreeNodeState<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData=any, initState extends TreeNodeStateType<data, state> = TreeNodeStateType<data, state>,
    initSyncData=any, initSyncState extends TreeNode<data, state> = TreeNode<data, state>,
    > {
    state: UnwrapRef<optionalType<initState, initData>>

    syncState: UnwrapRef<optionalType<initSyncState, initSyncData>>

    static initState(): TreeNodeStateType {
        return {
            level: 0,
            padSize: '1rem',
            toggleSize: '1rem',
            disableToggle: false,
            classNames: ({ node }: TreeItem) => ({
                basic: true,
                ...node.state,
            }),
        };
    }

    static initSyncState(): TreeNode {
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
    nodes: TreeNode<T, S>[];
    selectedNodes: TreeItem<T, S>[];
    firstSelectedNode: TreeItem<T, S>;
}

export type TreeNodeEventListener<T=any, S extends BaseNodeStateType = BaseNodeStateType>
    = (node: TreeItem<T, S>, matched: TreeItem<T, S>[], e: MouseEvent) => void;

export interface TreeNodeEventListeners<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    [eventName: string]: TreeNodeEventListener<T, S>;
}


export class TreeNodeToolSet<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData=any, initSyncData=any
    > extends TreeNodeState<data, state, initData, TreeNodeStateType<data, state>, initSyncData, TreeNode<data, state>> {
    metaState: TreeNodeMetaState<data, state> = null as unknown as TreeNodeMetaState<data, state>;

    setSelectedNodes: (item: TreeItem<data, state>) => void = () => {};


    constructor(initData: initData = {} as initData,
        initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
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
        default: ({ node }: TreeItem): ReturnType<ClassNamesType> => ({
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
        default: (): BaseNodeStateType => ({ expanded: false, selected: false, loading: false }),
        validator(state): boolean {
            return state instanceof Object && state.expanded !== undefined;
        },
        required: true,
    },
};
