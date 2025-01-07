import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import {
    getUseContextMenuAttachArgs,
    getUseContextMenuAttachArgTypes,
} from '@/hooks/use-context-menu-attach/story-helper';

import type { UseContextMenuItemsOptions } from './use-context-menu-items';

export const getUseContextMenuItemsArgs = (): Args => {
    const useContextMenuAttachArgs = getUseContextMenuAttachArgs();

    // rename attachHandler to handler
    const handler = useContextMenuAttachArgs.attachHandler;
    delete useContextMenuAttachArgs.attachHandler;
    useContextMenuAttachArgs.handler = handler;

    // remove filterItems
    delete useContextMenuAttachArgs.filterItems;

    return {
        ...useContextMenuAttachArgs,
        useReorderBySelection: false,
        selected: [],
        useMenuFiltering: false,
        hideHeaderWithoutItems: false,
    };
};

export const getUseContextMenuItemsParameters = (): Parameters => ({});

export const getUseContextMenuItemsArgTypes = (): ArgTypes<UseContextMenuItemsOptions> => {
    const useContextMenuAttachArgTypes: any = getUseContextMenuAttachArgTypes();
    const handlerArgType = { ...useContextMenuAttachArgTypes.attachHandler };

    // rename attachHandler to handler
    handlerArgType.name = 'handler';
    delete useContextMenuAttachArgTypes.attachHandler;
    useContextMenuAttachArgTypes.handler = handlerArgType;

    // remove filterItems
    delete useContextMenuAttachArgTypes.filterItems;

    return {
        ...useContextMenuAttachArgTypes,
        useReorderBySelection: {
            name: 'useReorderBySelection',
            type: { name: 'boolean' },
            description: 'Whether to automatically reorder on initiateMenu().',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'options',
                defaultValue: {
                    summary: false,
                },
            },
            control: 'boolean',
        },
        selected: {
            name: 'selected',
            type: { name: 'other', value: 'array' },
            description: 'Items to be displayed at the top of the menu for emphasize or quick access of selected items.',
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
        useMenuFiltering: {
            name: 'useMenuFiltering',
            type: { name: 'boolean' },
            description: 'Whether to automatically filtering menu by searchText. works only with menu, not with handler.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'options',
                defaultValue: {
                    summary: false,
                },
            },
            control: 'boolean',
        },
        hideHeaderWithoutItems: {
            name: 'hideHeaderWithoutItems',
            type: { name: 'boolean' },
            description: 'Whether to hide the header when there are no items.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'options',
                defaultValue: {
                    summary: false,
                },
            },
            control: 'boolean',
        },
    };
};
