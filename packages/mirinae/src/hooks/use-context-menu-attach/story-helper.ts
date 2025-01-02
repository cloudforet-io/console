import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { getContextMenuItems } from '@/controls/context-menu/mock';

import type { UseContextMenuAttachOptions } from './use-context-menu-attach';

export const getUseContextMenuAttachArgs = (): Args => ({
    attachHandler: undefined,
    menu: getContextMenuItems(),
    searchText: '',
    pageSize: 3,
    filterItems: [],
});

export const getUseContextMenuAttachParameters = (): Parameters => ({});

export const getUseContextMenuAttachArgTypes = (): ArgTypes<UseContextMenuAttachOptions> => ({
    attachHandler: {
        name: 'attachHandler',
        type: { name: 'other', value: 'function' },
        description: 'The handler function for attaching items. If not provided, the default handler will be used which works with the `menu` prop.',
        table: {
            type: {
                summary: 'function',
            },
            category: 'options',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    menu: {
        name: 'menu',
        type: { name: 'other', value: 'array' },
        description: 'Full menu items. This is used as the basis for the default attach handler.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'options',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    searchText: {
        name: 'searchText',
        type: { name: 'string' },
        description: 'The search text to filter the menu items by handler. It will be passed to the attach handler as the argument, so the handler can filter the items based on this text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'options',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'The number of items to attach at once.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'options',
            defaultValue: {
                summary: '10',
            },
        },
        control: 'number',
    },
    filterItems: {
        name: 'filterItems',
        type: { name: 'other', value: 'array' },
        description: 'The items to filter the menu items. This is used for filtering the result. '
            + 'It will be passed to the attach handler as the argument, so the handler can filter the items based on it. '
            + 'In case of using the `menu` prop, result items will be filtered by this prop automatically.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'options',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
});
