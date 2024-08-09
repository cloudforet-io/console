import { standardIconActionSet } from '@/data-display/board-item/mock';
import type { BoardSet, StyleOptions } from '@/data-display/board/type';

export const basicItemSets: BoardSet[] = [
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
    {
        title: 'title',
        description1: 'description1',
        description2: 'description2',
        iconButtonSets: standardIconActionSet,
    },
];

export const boardStandardItemSets: BoardSet[] = [
    {
        leftIcon: 'ic_settings',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'ic_share',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'ic_star',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'ic_service_home',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'ic_service_info',
        iconButtonSets: standardIconActionSet,
    },
];

export const cardsStyleOption: StyleOptions = {
    column: 3,
};
