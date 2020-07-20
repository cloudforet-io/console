import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/components/utils/component-toolset';

export const gridLayoutProps = {
    cardMinWidth: {
        type: String,
        default: '12rem',
    },
    cardMaxWidth: {
        type: String,
        default: '1fr',
    },
    cardHeight: {
        type: String,
        default: '20rem',
    },
    rowGap: {
        type: String,
        default: '1rem',
    },
    fixColumn: {
        type: Number,
        default: null,
    },
    columnGap: {
        type: String,
        default: '1rem',
    },
    cardClass: {
        type: Function,
        default: () => ['card-item'],
    },
    cardStyle: {
        type: Function,
        default: () => ({}),
    },
    items: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    selectItem: {
        type: String,
        default: '',
    },
};
export interface GridLayoutPropsType {
    items?: any[];
    cardMinWidth?: string;
    cardMaxWidth?: string;
    cardHeight?: string;
    rowGap?: string;
    fixColumn?: number;
    columnGap?: string;
    cardClass?: (...args: any[]) => any;
    cardStyle?: (...args: any[]) => any;
}


export interface GridLayoutStateType extends GridLayoutPropsType{
    items: any[];
    cardMinWidth: string;
    cardHeight: string;
    columnGap: string;
}
export interface GridLayoutSyncStateType {
   loading: boolean;
}

@StateToolSet<GridLayoutStateType>()
@SyncStateToolSet<GridLayoutSyncStateType>()
export class GridLayoutState<
    initData=any,
    initSyncData=any,
    initState extends GridLayoutStateType=GridLayoutStateType,
    initSyncState extends GridLayoutSyncStateType=GridLayoutSyncStateType,
    > {
    state: optionalType<initState, initData>;

    syncState: optionalType<initSyncState, initSyncData>;


    static initState() {
        return {
            items: [],
            cardMinWidth: '12rem',
            cardHeight: '12rem',
            columnGap: '1rem',
            cardClass: () => ['card-item'],
        };
    }


    static initSyncState() {
        return {
            loading: false,
        };
    }


    constructor(initData: initData = {} as initData, initSyncData: initSyncData = {}as initSyncData, lazy = false) {
        this.state = initReactive(lazy, GridLayoutState.initState(), initData);
        this.syncState = initReactive(lazy, GridLayoutState.initSyncState(), initSyncData);
    }
}
