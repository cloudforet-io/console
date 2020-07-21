import {
    initReactive, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import {
    ModalState, ModalStateType, ModalSyncStateType,
} from '@/components/molecules/modals/PModal.toolset';


export type ActionModalStateType = ModalStateType
export type ActionModalSyncStateType = ModalSyncStateType

@StateToolSet<ActionModalStateType>()
@SyncStateToolSet<ActionModalSyncStateType>()
export class ActionModalState<
    initData=any, initSyncData=any,
    initState extends ActionModalStateType =ActionModalStateType,
    initSyncState extends ActionModalSyncStateType = ActionModalSyncStateType,
    >
    extends ModalState<initData, initSyncData, initState, initSyncState > {
    static initState() {
        return {
            ...ModalState.initState(),
        };
    }

    static initSyncState() {
        return {
            ...ModalState.initSyncState(),
        };
    }

    constructor(initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{}, lazy = false) {
        super(initData, initSyncData, true);
        this.state = initReactive(lazy, ActionModalState.initState(), initData);
        this.syncState = initReactive(lazy, ActionModalState.initSyncState(), initSyncData);
    }
}
