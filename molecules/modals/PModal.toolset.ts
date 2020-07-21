import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';

export enum sizeMapping {
    sm='modal-sm',
    md= '',
    lg= 'modal-lg',
    xl= 'modal-xl',
}

export const modalSizeValidator = value => Object.keys(sizeMapping).includes(value);

export type ModalSizeType = 'sm'|'md'|'lg'|'xl';
export interface ModalStateType {
    fade: boolean;
    scrollable: boolean;
    size: ModalSizeType;
}

export interface ModalSyncStateType {
    visible: boolean;
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

@HelperToolSet()
export class ModalToolSet<initData=any, initSyncData=any> extends ModalState<initData, initSyncData> {
    // eslint-disable-next-line no-empty-function
    close: () => void=() => {};

    // eslint-disable-next-line no-empty-function
    open: () => void=() => {};

    static initToolSet(_this: ModalToolSet) {
        _this.close = () => {
            if (_this.syncState.visible) {
                _this.syncState.visible = false;
            }
        };
        _this.open = () => {
            if (!_this.syncState.visible) {
                _this.syncState.visible = true;
            }
        };
    }

    constructor(initData: initData = <initData>{}, initSyncData: initSyncData = <initSyncData>{}, lazy = false) {
        super(initData, initSyncData);
        if (!lazy) {
            ModalToolSet.initToolSet(this);
        }
    }
}
