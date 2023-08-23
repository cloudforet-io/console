import type { BoardSet, StyleOptions } from '@/data-display/board/type';
import { standardIconActionSet } from '@/data-display/board-item/mock';

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
        leftIcon: 'img_avatar_admin',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'img_avatar_project-admin',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'img_resource_default',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'ic_resource_hexagon',
        iconButtonSets: standardIconActionSet,
    },
    {
        leftIcon: 'img_resource_server',
        iconButtonSets: standardIconActionSet,
    },
];

export const cardsStyleOption: StyleOptions = {
    column: 3,
};
