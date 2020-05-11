import { CardListProps, cardListProps } from '@/components/organisms/lists/card-list/PCardList.toolset';

export const toolboxCardListProps = {
    ...cardListProps,
    totalCount: {
        type: Number,
        default: 0,
    },
    title: {
        type: String,
        default: '',
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
    sortByIdx: {
        type: Number,
        default: 0,
    },
};

export interface ToolboxCardListProps extends CardListProps {
    title: string;
    totalCount: number;
}
