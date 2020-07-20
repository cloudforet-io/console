import {
    computed,
    getCurrentInstance,
    onMounted, reactive, ref, Ref, watch,
} from '@vue/composition-api';

import {
    HelperToolSet, initReactive, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import {
    ModalState, ModalStateType, ModalSyncStateType, ModalToolSet,
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
