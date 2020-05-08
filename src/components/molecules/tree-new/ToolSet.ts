import {
    computed, reactive, Ref, ref,
} from '@vue/composition-api';
import _ from 'lodash';
import {
    HelperToolSet, initReactive, optionalType, StateToolSet,
} from '@/lib/toolset';

type TreeNode = any;

export type TreeStateType = {
    selected?: boolean;
    selectable?: boolean;
    checked?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    visible?: boolean;
    indeterminate?: boolean;
    matched?: boolean;
    editable?: boolean;
    dragging?: boolean;
    draggable?: boolean;
    dropable?: boolean;
}

export interface TreeOptionsInterface {
    multiple?: boolean;
    checkbox?: boolean;
    checkOnSelect?: boolean;
    autoCheckChildren?: boolean;
    parentSelect?: boolean;
    keyboardNavigation?: boolean;
    propertyNames?: {
        id?: string;
        text?: string;
        children?: string;
        isBatch?: string;
    };
    deletion?: [boolean, (node: TreeNode) => boolean];
    fetchData?: (node: TreeNode) => Promise<any>;
    dnd?: {
        onDragStart?: (node: TreeNode) => boolean;
        onDragOn?: (targetNode: TreeNode, destinationNode: TreeNode) => boolean;
        onDragFinish?: (targetNode: TreeNode, destinationNode: TreeNode) => boolean;
    };
    editing?: object;
    nodeIndent?: number;
}

export interface TreeItemInterface<data = object> {
    id?: number|string;
    text: string;
    data?: data;
    children?: TreeItemInterface[];
    state?: TreeStateType;
    isBatch?: boolean; // does it have child nodes
}

export default class TreeItem implements TreeItemInterface {
    constructor(
        public text: string,
        public data?: object,
        public children?: TreeItemInterface[],
        public state?: TreeStateType,
        public id?: number|string,
        public isBatch?: boolean,
    ) { }
}

interface TreeIconsType {
    leaf: string;
    expanded: string;
    collapsed: string;
}

export interface TreePropsInterface {
    data?: any[];
    options?: TreeOptionsInterface;
    icons?: TreeIconsType;
    loading?: boolean;
    selectMode?: boolean;
    cacheMode?: boolean;
}

@StateToolSet<TreePropsInterface>()
export class TreeState<initData, initState extends TreePropsInterface = TreePropsInterface> {
    state: optionalType<initState, initData>

    static initState() {
        return {
            icons: {
                leaf: 'ic_tree_project',
                expanded: 'ic_tree_folder--opened',
                collapsed: 'ic_tree_folder',
            },
            loading: false,
            selectMode: false,
            cacheMode: true,
            data: [],
            options: {},
        };
    }

    constructor(initData: initData = <initData>{}, lazy = false) {
        this.state = initReactive(lazy, TreeState.initState(), initData);
    }
}


export const treeProps = {
    /**
     * tree data for initiation and it's not reactive.
     * @type {Array, Object}
     * */
    data: {
        type: [Array, Object],
        default: undefined,
    },
    /**
     * tree options that follows LiquorTree's options format. it's not reactive.
     * @type {TreeOptionsInterface}
     * */
    options: {
        type: Object,
        default: () => ({}),
    },
    /**
     * tree icons
     * @type {TreeIconsInterface}
     */
    icons: {
        type: Object,
        default: () => ({
            leaf: 'ic_tree_project',
            expanded: 'ic_tree_folder--opened',
            collapsed: 'ic_tree_folder',
        }),
    },
    loading: {
        type: Boolean,
        default: false,
    },
    selectMode: {
        type: Boolean,
        default: false,
    },
    cacheMode: {
        type: Boolean,
        default: true,
    },
};

export interface TreeMetaState {
    selectedNode: any[]|null;
    firstSelectedNode: Ref<any>;
}

@HelperToolSet()
export class TreeToolSet<initDataType> extends TreeState<initDataType> {
    metaState: TreeMetaState = null as unknown as TreeMetaState;

    tree: Ref<any>=null as unknown as Ref<any>;

    // eslint-disable-next-line no-empty-function
    getSelectedNode: (event?: any) => void=() => {};

    static initToolSet(_this: any, treeRef: Ref<any> = ref(null), treePath: string[] = ['treeRef', 'value', '$refs', 'tree']) {
        _this.treeRef = treeRef;
        _this.metaState = reactive({
            selectedNode: null,
            firstSelectedNode: computed(() => {
                try {
                    return _this.metaState.selectedNode[0];
                } catch (e) {
                    return null;
                }
            }),
        });
        _this.tree = computed(() => _.get(_this, treePath));
        _this.getSelectedNode = (event?: any) => {
            // console.debug('getSelectedNode', event, _this.tree.value.selected());
            _this.metaState.selectedNode = event ? [event] : [];
        };
    }

    constructor(initData: initDataType = {} as initDataType, public treeRef: Ref<any> = ref(null)) {
        super(initData);
        TreeToolSet.initToolSet(this, treeRef);
    }
}
