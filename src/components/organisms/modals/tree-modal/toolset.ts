import {
    onMounted, reactive, ref, Ref, watch,
} from '@vue/composition-api';
import {
    TreeMetaState, TreePropsInterface, TreeState, TreeToolSet,
} from '@/components/molecules/tree-new/ToolSet';
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
    }
}

@HelperToolSet()
export class TreeModalToolSet<initData, initSyncData>
    extends TreeModalState<initData, initSyncData>
    implements ModalToolSet<initData, initSyncData>, TreeToolSet<initData> {
    public metaState:TreeMetaState = null as unknown as TreeMetaState;

    // eslint-disable-next-line no-empty-function
    public getSelectedNode:(evnet?:any)=>void=() => {};

    // eslint-disable-next-line no-empty-function
    public close:()=>void=() => {};

    // eslint-disable-next-line no-empty-function
    public open:()=>void=() => {};


    static initToolSet(_this:any, treeApi:Ref<any> = ref(null)) {
        ModalToolSet.initToolSet(_this);
        TreeToolSet.initToolSet(_this, treeApi);
        onMounted(() => {
            watch(() => _this.syncState.visible, (now, pre) => {
                if (now && now !== pre) {
                    _this.metaState.selectedNode = [];
                }
            });
        });
        _this.getSelectedNode = () => {
            console.debug('this api', _this.treeApi);
            _this.metaState.selectedNode = _this.treeApi.value.$refs['p-tree'].$refs.tree.selected();
        };
    }

    constructor(initData:initData = <initData>{}, initSyncData:initSyncData = <initSyncData>{}, public treeApi:Ref<any> = ref(null), lazy :boolean = false) {
        super(initData, initSyncData);
        if (!lazy) {
            TreeModalToolSet.initToolSet(this);
        }
    }
}
