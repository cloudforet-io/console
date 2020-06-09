import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { TreeMetaState } from '@/components/molecules/tree-origin/ToolSet';
import {
    computed, reactive, ref, Ref,
} from '@vue/composition-api';
import _ from 'lodash';

export const treeNodeProps = {
    level: {
        type: Number,
        default: 0,
    },
    classNames: {
        type: Function,
        default: () => ['basic'],
    },
    disableToggle: {
        type: Boolean,
        default: false,
    },
    toggleSize: {
        type: String,
        default: '1rem',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    selected: {
        type: Boolean,
        default: false,
    },
    expanded: {
        type: Boolean,
        default: false,
    },
    padSize: {
        type: String,
        default: '1rem',
    },
    data: {
        type: [Array, Object, Boolean, String, Number],
        default: '',
    },
    children: {
        type: [Array, Boolean],
        default: false,
    },
};

export interface TreeNodeStateType {
    level?: number; // generate
    padSize?: string; // bypass
    toggleSize?: string; // bypass
    disableToggle?: boolean; // bypass
    classNames?: (...args) => string[]; // bypass
}

export interface TreeNodeSyncStateType<T=any> {
    data: T;
    disabled: boolean;
    selected: boolean;
    expanded: boolean;
    children: TreeNode[] | boolean;
}

export interface TreeNode extends TreeNodeStateType, TreeNodeSyncStateType {
}

export type TreeNodeProps = TreeNode;

export interface DefaultNodeType extends TreeNodeStateType {
    disabled?: boolean;
    selected?: boolean;
    expanded?: boolean;
    children?: TreeNode[] | boolean;
}

export const getDefaultNode = <T=any>(data: T, init?: DefaultNodeType): TreeNodeSyncStateType => ({
    data,
    disabled: false,
    selected: false,
    expanded: false,
    children: false,
    ...init,
});


@StateToolSet<TreeNodeStateType>()
@SyncStateToolSet<TreeNodeSyncStateType>()
export class TreeNodeState<
    initData=any, initState extends TreeNodeStateType = TreeNodeStateType,
    initSyncData=any, initSyncState extends TreeNodeSyncStateType = TreeNodeSyncStateType,
    > {
    state: UnwrapRef<optionalType<initState, initData>>

    syncState: UnwrapRef<optionalType<initSyncState, initSyncData>>

    static initState(): TreeNodeStateType {
        return {
            level: 0,
            classNames: () => ['basic'],
            padSize: '1rem',
            toggleSize: '1rem',
            disableToggle: true,
        };
    }

    static initSyncState(): TreeNodeSyncStateType {
        return {
            data: '',
            disabled: false,
            selected: false,
            expanded: false,
            children: false,
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        this.state = initReactive(lazy, TreeNodeState.initState(), initData);
        this.syncState = initReactive(lazy, TreeNodeState.initSyncState(), initSyncData);
    }
}

export interface TreeNodeMetaState {
    nodes: TreeNode[];
    selectedNodes: TreeNode[];
    firstSelectedNode: TreeNode;
    loading: boolean;
}


@HelperToolSet()
export class TreeNodeToolSet<initData, initSyncData> extends TreeNodeState<
    initData, TreeNodeStateType, initSyncData> {
    metaState: UnwrapRef<TreeNodeMetaState> = null as unknown as TreeNodeMetaState;

    // eslint-disable-next-line no-empty-function
    getSelectedNode: (event?: any) => void = () => {};

    static initToolSet(_this: TreeNodeToolSet<any, any>) {
        _this.metaState = reactive({
            nodes: [],
            selectedNodes: [],
            firstSelectedNode: computed(() => _this.metaState.selectedNodes[0]),
            loading: false,
        });
        _this.getSelectedNode = (event?: any) => {
            // console.debug('getSelectedNode', event, _this.tree.value.selected());
            _this.metaState.selectedNodes = event ? [event] : [];
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData) {
        super(initData, initSyncData);
        TreeNodeToolSet.initToolSet(this);
    }
}
