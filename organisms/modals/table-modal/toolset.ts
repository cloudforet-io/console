import {
    HelperToolSet, initReactive, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import {
    ModalState, ModalStateType, ModalSyncStateType, ModalToolSet,
} from '@/components/molecules/modals/PModal.toolset';
import { MultiItemAction } from '@/lib/fluent-api';


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
            action: null as unknown as MultiItemAction<any, any>,
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
