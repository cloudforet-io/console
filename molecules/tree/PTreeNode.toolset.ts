/* eslint-disable @typescript-eslint/no-explicit-any,no-empty-function */
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import {
    computed, reactive,
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
}

type ClassNamesType<T=any, S extends BaseNodeStateType = BaseNodeStateType> = (node: TreeItem<T, S>) => {[name: string]: boolean};

export interface TreeNodeProps<T=any, S extends BaseNodeStateType = BaseNodeStateType> extends TreeNodeStateType, TreeNode<T, S> {}

export interface TreeNode<T=any, S extends BaseNodeStateType = BaseNodeStateType> {
    data: T;
    children: TreeNode<T, S>[] | boolean;
    state: S;
}

export const getBaseNodeState = (): BaseNodeStateType => ({ expanded: false, selected: false });

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


@HelperToolSet()
export class TreeNodeToolSet<
    data=any, state extends BaseNodeStateType = BaseNodeStateType,
    initData=any, initSyncData=any
    > extends TreeNodeState<data, state, initData, TreeNodeStateType<data, state>, initSyncData, TreeNode<data, state>> {
    metaState: TreeNodeMetaState<data, state> = null as unknown as TreeNodeMetaState<data, state>;

    isMultiSelect = false;

    setSelectedNodes: (item: TreeItem<data, state>) => void = () => {};

    /**
     * @param node
     * @param state
     * @description Since it is changed by an event-driven method, there may be side effects when used continuously.
     */
    setNodeState: (item: TreeItem<data, state>, state: {[name: string]: boolean}) => void
        = ({ node }: TreeItem<data, state>, state: {[name: string]: boolean}) => {
            node.state = {
                ...node.state,
                ...state,
            } as state;
        };

    /**
     * @param node
     * @description Use this method at the end after changing the property value of node state
     */
    applyState: (item: TreeItem<data, state>) => void
        = ({ node }: TreeItem<data, state>) => {
            node.state = {
                ...node.state,
            } as state;
        };

    deleteNode: (item: TreeItem<data, state>) => void
        = ({ parent, node, key }: TreeItem<data, state>) => {
            if (parent && Array.isArray(parent.node.children)) {
                parent.node.children.splice(key, 1);
                if (parent.node.children.length === 0) parent.node.children = false;
            } else {
                this.metaState.nodes.splice(key, 1);
            }
        };

    static initToolSet(_this: TreeNodeToolSet<any, any>, isMultiSelect: boolean): void {
        _this.isMultiSelect = isMultiSelect;
        _this.metaState = reactive({
            nodes: [],
            selectedNodes: [],
            firstSelectedNode: computed(() => _this.metaState.selectedNodes[0]),
        }) as TreeNodeMetaState;
        _this.setSelectedNodes = (item: TreeItem): void => {
            // TODO: multi select case
            // if (_this.isMultiSelect) {
            // const idx = findIndex(_this.metaState.selectedNodes, (d: TreeItem) => d.key === node.key && d.level === node.level);
            // if (idx === -1) _this.metaState.selectedNodes.push(node);
            // else _this.metaState.selectedNodes.splice(idx, 1);
            // }

            if (_this.metaState.firstSelectedNode) {
                _this.setNodeState(_this.metaState.firstSelectedNode, { selected: false });
                if (_this.metaState.firstSelectedNode.key === item.key && _this.metaState.firstSelectedNode.level === item.level) {
                    _this.metaState.selectedNodes = [];
                    return;
                }
            }
            _this.setNodeState(item, { selected: true });
            _this.metaState.selectedNodes = [item];
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
        default: (): BaseNodeStateType => ({ expanded: false, selected: false }),
        validator(state): boolean {
            return state instanceof Object && state.expanded !== undefined;
        },
        required: true,
    },
};
