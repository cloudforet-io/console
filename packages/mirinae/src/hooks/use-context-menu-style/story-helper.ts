import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import type { UseContextMenuStyleOptions } from './use-context-menu-style';

export const getUseContextMenuStyleArgs = (): Args => ({
    useFixedMenuStyle: false,
    visibleMenu: false,
    targetRef: undefined,
    menuRef: undefined,
    position: 'left',
    menuWidth: 'auto',
});

export const getUseContextMenuStyleParameters = (): Parameters => ({});

export const getUseContextMenuStyleArgTypes = (): ArgTypes<UseContextMenuStyleOptions> => ({
    useFixedMenuStyle: {
        name: 'useFixedMenuStyle',
        type: { name: 'boolean' },
        description: 'Whether to use fixed menu style or not.',
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
    visibleMenu: {
        name: 'visibleMenu',
        type: { name: 'boolean' },
        description: 'Whether the menu is visible or not.',
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
    targetRef: {
        name: 'targetRef',
        type: { name: 'other', value: 'HTMLElement' },
        description: 'The target element of the context menu.',
        table: {
            type: {
                summary: 'HTMLElement',
            },
            category: 'options',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'object',
    },
    menuRef: {
        name: 'menuRef',
        type: { name: 'other', value: 'PContextMenu' },
        description: 'The menu element of the context menu.',
        table: {
            type: {
                summary: 'PContextMenu',
            },
            category: 'options',
            defaultValue: {
                summary: 'null',
            },
        },
        control: 'object',
    },
    position: {
        name: 'position',
        type: { name: 'string' },
        description: 'The position where the context menu will be displayed.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'options',
            defaultValue: {
                summary: 'left',
            },
        },
        control: 'select',
        options: ['left', 'right'],
    },
    menuWidth: {
        name: 'menuWidth',
        type: { name: 'string' },
        description: 'The width of the context menu.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'options',
            defaultValue: {
                summary: 'auto',
            },
        },
        control: 'text',
    },
});
