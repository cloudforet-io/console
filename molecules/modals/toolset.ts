import {
    onMounted, reactive, ref, Ref, watch,
} from '@vue/composition-api';
import { TreeToolSet } from '@/components/molecules/tree-new/ToolSet';

export const enum sizeMapping {
    sm='modal-sm',
    md= '',
    lg= 'modal-lg',
    xl= 'modal-xl',
}
export type ModalSizeType = 'sm'|'md'|'lg'|'xl'
export interface ModalStateType {
    fade:boolean
    scrollable:boolean
    size: ModalSizeType
}

export interface ModalSyncStateType {
    visible:boolean
}

export class ModalState<stateType, syncStateType> {
    public state:ModalStateType&stateType;

    public syncState:ModalSyncStateType&syncStateType;

    protected initState:ModalStateType = {
        fade: false,
        scrollable: false,
        size: 'md',
    };

    protected initSyncState:ModalSyncStateType = {
        visible: false,
    };


    constructor(initData:stateType|any = {}, initSyncData:syncStateType|any = {}) {
        this.state = reactive({
            ...initData,
        });
        this.syncState = reactive({
            ...this.initSyncState,
            ...initSyncData,
        });
    }
}
