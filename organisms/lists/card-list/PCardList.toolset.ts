import { initReactive, optionalType, StateToolSet } from '@/lib/toolset';

export interface Mapper {
    key?: string;
    icon?: string;
    title?: string;
    contents?: string;
}

export const cardListProps = {
    items: {
        type: Array,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        default: (): any[] => [],
    },
    mapper: {
        type: Object,
        default: (): Mapper => ({}),
    },
    loading: {
        type: Boolean,
        default: true,
    },
    defaultIcon: {
        type: String,
        default: 'ic_collector_tags',
    },
    skeletonRows: {
        type: Number,
        default: 5,
    },
};

export interface CardListProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[];
    mapper: Mapper;
    loading: boolean;
    defaultIcon: string;
    skeletonRows: number;
}

export type CardListStateType = CardListProps;

@StateToolSet<CardListStateType>()
export class CardListState<D = CardListStateType, S extends CardListStateType = CardListStateType> {
    state: optionalType<S, D>

    static initState(): CardListStateType {
        return {
            items: [],
            mapper: {},
            loading: true,
            defaultIcon: 'ic_collector_tags',
            skeletonRows: 5,
        };
    }

    constructor(initData: D = {} as D, lazy = false) {
        this.state = initReactive(lazy, CardListState.initState(), initData);
    }
}
