import {
    HelperToolSet, initReactive, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { Ref, UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { watch } from '@vue/composition-api';
import _ from 'lodash';

export const dictPanelProps = {
    /**
     * sync
     */
    dict: {
        type: Object,
        default: () => ({}),
    },
    /**
     * sync
     */
    editMode: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    showEmptyInput: {
        type: Boolean,
        default: false,
    },
};


interface DictPanelType {
    showEmptyInput: boolean;
    loading: boolean;
}

interface DictPanelSyncType {
    dict: object;
    editMode: boolean;
}

export interface DictPanelPropsType extends DictPanelType, DictPanelSyncType {}

@StateToolSet<DictPanelType>()
@SyncStateToolSet<DictPanelSyncType>()
export class DictPanelState<D, SyncD, S extends DictPanelType, SyncS extends DictPanelSyncType> {
    state: UnwrapRef<S> = null as UnwrapRef<S>;

    syncState: UnwrapRef<SyncS> = null as UnwrapRef<SyncS>;

    static initState(): DictPanelType {
        return {
            showEmptyInput: false,
            loading: false,
        };
    }

    static initSyncState(): DictPanelSyncType {
        return {
            dict: {},
            editMode: false,
        };
    }

    constructor(initData: D = {} as D, initSyncData: SyncD = {} as SyncD, lazy = false) {
        this.state = initReactive(lazy, DictPanelState.initState(), initData);
        this.syncState = initReactive(lazy, DictPanelState.initSyncState(), initSyncData);
    }
}

@HelperToolSet()
export class DictPanelToolSet<D=any, SyncD=any> extends DictPanelState<D, SyncD, DictPanelType, DictPanelSyncType> {
    selectedItem: Ref<any> | Ref<Readonly<any>>;

    static initToolSet(_this: DictPanelToolSet): void {
        watch(() => _this.selectedItem.value, (val) => {
            console.log('selected item changed', val);
            _this.syncState.dict = _.get(val, 'tags', {});
            _this.syncState.editMode = false;
        });
    }

    listeners: any = {
        save: () => { this.syncState.editMode = false; },
    }

    constructor(initData: D = {} as D,
        initSyncData: SyncD = {} as SyncD,
        parentItem: Ref<any> | Ref<Readonly<any>>,
        lazy = false) {
        super(initData, initSyncData);
        this.selectedItem = parentItem;
        if (!lazy) DictPanelToolSet.initToolSet(this);
    }
}
