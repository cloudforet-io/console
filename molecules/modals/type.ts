import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';

export enum sizeMapping {
    sm = 'modal-sm',
    md = '',
    lg = 'modal-lg',
    xl = 'modal-xl',
}
export type ModalSizeType = keyof typeof sizeMapping;
export interface ModalStateType {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
}

export interface ModalSyncStateType {
    visible: boolean;
}

export interface ModalProps {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
    visible: boolean; // sync
    centered: boolean;
    backdrop: boolean;
}

@StateToolSet<ModalStateType>()
@SyncStateToolSet<ModalSyncStateType>()
export class ModalState<
        initData=any, initSyncData=any,
        initState extends ModalStateType=ModalStateType,
        initSyncState extends ModalSyncStateType = ModalSyncStateType> {
    state: optionalType<initState, initData>;

     syncState: optionalType<initSyncState, initSyncData>;

     static initState() {
         return {
             fade: false,
             scrollable: false,
             size: 'md' as ModalSizeType,
         };
     }

     static initSyncState() {
         return {
             visible: false,
         };
     }

     constructor(initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{}, lazy = false) {
         this.state = initReactive(lazy, ModalState.initState(), initData);
         this.syncState = initReactive(lazy, ModalState.initSyncState(), initSyncData);
     }
}
