import { MenuItem } from '@/components/organisms/context-menu/type';
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/util/toolset-helpers';
import { UnwrapRef } from '@vue/composition-api';

export const selectDropdownProps = {
    items: {
        type: Array,
        default: () => [],
    },
    selectItem: {
        type: [String, Number],
    },
    invalid: {
        type: Boolean,
        default: false,
    },
    autoHeight: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
};

export interface SelectDropdownStateType {
    items: MenuItem[];
    invalid: boolean;
    autoHeight: boolean;
    disabled: boolean;
    loading: boolean;
}

export interface SelectDropdownSyncStateType {
    selectItem: string | number;
}

export interface SelectDropdownProps extends SelectDropdownStateType, SelectDropdownSyncStateType {}


@StateToolSet<SelectDropdownStateType>()
@SyncStateToolSet<SelectDropdownSyncStateType>()
export class SelectDropdownState<
    D = SelectDropdownStateType,
    SD = SelectDropdownSyncStateType,
    S extends SelectDropdownStateType = SelectDropdownStateType,
    SS extends SelectDropdownSyncStateType = SelectDropdownSyncStateType
    > {
    state: UnwrapRef<optionalType<S, D>>;

    syncState: UnwrapRef<optionalType<SS, SD>>;

    static initState(): SelectDropdownStateType {
        return {
            items: [],
            invalid: false,
            autoHeight: false,
            disabled: false,
            loading: false,
        };
    }

    static initSyncState(): SelectDropdownSyncStateType {
        return {
            selectItem: '',
        };
    }

    constructor(initData: D = {} as D, initSyncData: SD = {} as SD, lazy = false) {
        this.state = initReactive(lazy, SelectDropdownState.initState(), initData);
        this.syncState = initReactive(lazy, SelectDropdownState.initSyncState(), initSyncData);
    }
}

@HelperToolSet()
export class SelectDropdownToolSet<
    D = SelectDropdownStateType, SD = SelectDropdownSyncStateType> extends SelectDropdownState<D, SD> {
    static initToolSet() {}

    constructor(initData: D = {} as D, initSyncData: SD = {} as SD) {
        super(initData, initSyncData);
    }
}
