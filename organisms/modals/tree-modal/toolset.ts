import {
    computed,
    getCurrentInstance,
    onMounted, reactive, ref, Ref, watch,
} from '@vue/composition-api';
import {
    TreeMetaState, TreePropsInterface, TreeState, TreeToolSet,
} from '@/components/molecules/tree-origin/ToolSet';
import {
    HelperToolSet, initReactive, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import {
    ModalState, ModalStateType, ModalSyncStateType, ModalToolSet,
} from '@/components/molecules/modals/toolset';


export type TreeModalStateType = ModalStateType & TreePropsInterface;

export type TreeModalSyncStateType = ModalSyncStateType;

@StateToolSet<TreeModalStateType>()
@SyncStateToolSet<TreeModalSyncStateType>()
export class TreeModalState<
    initData=any, initSyncData=any,
    initState extends TreeModalStateType =TreeModalStateType,
    initSyncState extends TreeModalSyncStateType = TreeModalSyncStateType,
    >
    extends ModalState<initData, initSyncData, initState, initSyncState >
    implements TreeState<initData, initState> {
    static initState() {
        return {
            ...ModalState.initState(),
            ...TreeState.initState(),
        };
    }

    static initSyncState() {
        return {
            ...ModalState.initSyncState(),
        };
    }

    constructor(initData:initData = <initData>{}, initSyncData:initSyncData = <initSyncData>{}, lazy :boolean = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, TreeModalState.initState(), initData);
        this.syncState = initReactive(lazy, TreeModalState.initSyncState(), initSyncData);
        console.debug(initData, this.state.selectMode);
    }
}

@HelperToolSet()
export class TreeModalToolSet<initData=any, initSyncData=any>
    extends TreeModalState<initData, initSyncData>
    implements ModalToolSet<initData, initSyncData>, TreeToolSet<initData> {
    public tree: Ref<any> = null as unknown as Ref<any>;

    public metaState:TreeMetaState = null as unknown as TreeMetaState;

    // eslint-disable-next-line no-empty-function
    public getSelectedNode:(evnet?:any)=>void=() => {};

    // eslint-disable-next-line no-empty-function
    public close:()=>void=() => {};

    // eslint-disable-next-line no-empty-function
    public open:()=>void=() => {};

    public vm = getCurrentInstance();

    public confirm:()=>void = () => {
        // @ts-ignore
        let result:any|any[];
        if (this.state.options?.multiple) {
            result = this.metaState.selectedNode;
        } else {
            result = this.metaState.firstSelectedNode;
        }
        // @ts-ignore
        this.vm.$listeners.confirm(result);
    };


    static initToolSet(_this:any, treeRef:Ref<any> = ref(null)) {
        ModalToolSet.initToolSet(_this);
        TreeToolSet.initToolSet(_this, treeRef, ['treeRef', 'value', '$refs', 'p-tree', '$refs', 'tree']);
        onMounted(() => {
            watch(() => _this.syncState.visible, (now, pre) => {
                if (now && now !== pre) {
                    _this.metaState.selectedNode = [];
                }
            });
        });
    }

    constructor(initData:initData = <initData>{}, initSyncData:initSyncData = <initSyncData>{}, public treeRef:Ref<any> = ref(null), lazy :boolean = false) {
        super(initData, initSyncData);
        if (!lazy) {
            TreeModalToolSet.initToolSet(this, treeRef);
        }
    }
}
