
import {
    initReactive, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import {
    ModalState, ModalStateType, ModalSyncStateType,
} from '@/components/molecules/modals/PModal.toolset';


export type DoubleCheckModalSyncStateType = ModalSyncStateType

export interface DoubleCheckModalStateType extends ModalStateType{
    headerTitle: string;
    subTitle: string;
    verificationText: string;
}
@StateToolSet<DoubleCheckModalStateType>()
@SyncStateToolSet<DoubleCheckModalSyncStateType>()
export class DoubleCheckModalState<
    initData=any, initSyncData=any,
    initState extends DoubleCheckModalStateType =DoubleCheckModalStateType,
    initSyncState extends DoubleCheckModalSyncStateType = DoubleCheckModalSyncStateType,
    >
    extends ModalState<initData, initSyncData, initState, initSyncState > {
    static initState() {
        return {
            ...ModalState.initState(),
            headerTitle: '',
            subTitle: '',
            verificationText: '',
        };
    }

    static initSyncState() {
        return {
            ...ModalState.initSyncState(),
        };
    }

    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {} as initSyncData, lazy = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, DoubleCheckModalState.initState(), initData);
        this.syncState = initReactive(lazy, DoubleCheckModalState.initSyncState(), initSyncData);
    }
}
