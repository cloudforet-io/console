import { CardListProps, cardListProps, CardListState } from '@/components/organisms/lists/card-list/PCardList.toolset';
import { MenuItem } from '@/components/organisms/context-menu/context-menu/PContextMenu.toolset';
import {
    HelperToolSet,
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

export const toolboxCardListProps = {
    ...cardListProps,
    title: {
        type: String,
        default: '',
    },
    totalCount: {
        type: Number,
        default: 0,
    },
    sortMenu: {
        type: Array,
        default: null,
    },
    thisPage: {
        type: Number,
        default: 1,
    },
    pageSize: {
        type: Number,
        default: 10,
    },
    sortBy: {
        type: [String, Number],
        default: '',
    },
};

export interface ToolboxCardListStateType extends CardListProps {
    title: string;
    totalCount: number;
    sortMenu: MenuItem[];
    pageSize: number;
}

export interface ToolboxCardListSyncStateType {
    sortBy: string | number;
    thisPage: number;
}

export interface ToolboxCardListProps extends ToolboxCardListStateType, ToolboxCardListSyncStateType {}

@StateToolSet<ToolboxCardListStateType>()
@SyncStateToolSet<ToolboxCardListSyncStateType>()
export class ToolboxCardListState<
    D = ToolboxCardListStateType,
    SD = ToolboxCardListSyncStateType,
    S extends ToolboxCardListStateType = ToolboxCardListStateType,
    SS extends ToolboxCardListSyncStateType = ToolboxCardListSyncStateType,
    > extends CardListState<D, S> {
    syncState: UnwrapRef<optionalType<SS, SD>>

    static initState(): ToolboxCardListStateType {
        return {
            ...CardListState.initState(),
            title: '',
            totalCount: 0,
            sortMenu: [],
            pageSize: 10,
        };
    }

    static initSyncState(): ToolboxCardListSyncStateType {
        return {
            sortBy: '',
            thisPage: 1,
        };
    }

    constructor(initData: D = {} as D, initSyncData: SD = {} as SD, lazy = false) {
        super(initData, true);
        this.state = initReactive(lazy, ToolboxCardListState.initState(), initData);
        this.syncState = initReactive(lazy, ToolboxCardListState.initSyncState(), initSyncData);
    }
}

@HelperToolSet()
export class ToolboxCardListToolSet<
    D = ToolboxCardListStateType, SD = ToolboxCardListSyncStateType>
    extends ToolboxCardListState<D, SD> {
    static initToolSet() {}

    constructor(initData: D = {} as D, initSyncData: SD = {} as SD) {
        super(initData, initSyncData);
    }
}
