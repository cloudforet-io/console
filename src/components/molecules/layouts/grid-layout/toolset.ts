import {
    initReactive, optionalType, StateToolSet, SyncStateToolSet,
} from '@/lib/toolset';

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
        default: () => [],
    },
    cardStyle: {
        type: Function,
        default: () => ({}),
    },
    items: {
        type: Array,
        default: () => [],
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


@StateToolSet<GridLayoutStateType>()
export class GridLayoutState<
    initData=any,
    initState extends GridLayoutStateType=GridLayoutStateType,
    > {
    state: optionalType<initState, initData>;

    static initState() {
        return {
            items: [],
            cardMinWidth: '12rem',
            cardHeight: '12rem',
            columnGap: '1rem',
        };
    }


    constructor(initData: initData = {} as initData, lazy = false) {
        this.state = initReactive(lazy, GridLayoutState.initState(), initData);
    }
}
