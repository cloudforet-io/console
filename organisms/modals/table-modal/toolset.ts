import {
    initReactive, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import {
    ModalState, ModalStateType, ModalSyncStateType,
} from '@/components/molecules/modals/PModal.toolset';


export type TableCheckModalSyncStateType = ModalSyncStateType

export interface TableCheckModalStateType extends ModalStateType{
    mode: string;
    items: any[];
    fields: string[];
    action: any;
    headerTitle: string;
    subTitle: string;
    themeColor: string;
}
@StateToolSet<TableCheckModalStateType>()
@SyncStateToolSet<TableCheckModalSyncStateType>()
export class TableCheckModalState<
    initData=any, initSyncData=any,
    initState extends TableCheckModalStateType =TableCheckModalStateType,
    initSyncState extends TableCheckModalSyncStateType = TableCheckModalSyncStateType,
    >
    extends ModalState<initData, initSyncData, initState, initSyncState > {
    static initState() {
        return {
            ...ModalState.initState(),
            mode: '',
            items: [],
            fields: [],
            action: null as any,
            headerTitle: '',
            subTitle: '',
            themeColor: '',
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, TableCheckModalState.initState(), initData);
        this.syncState = initReactive(lazy, TableCheckModalState.initSyncState(), initSyncData);
    }
}
