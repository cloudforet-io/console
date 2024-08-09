import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';

export const getCollapsibleToggleArgs = (): Args => ({
    'v-model': '',
    isCollapsed: true,
    toggleType: COLLAPSIBLE_TOGGLE_TYPE.text,
    defaultSlot: 'Show',
});

export const getCollapsibleToggleParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});


export const getCollapsibleToggleArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: { name: 'boolean' },
        description: 'Two way binding for `isCollapsed` props with `update:isCollapsed` event.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'model',
            defaultValue: {
                summary: '',
            },
        },
        control: null,
    },
    isCollapsed: {
        name: 'isCollapsed',
        type: { name: 'boolean' },
        description: 'Collapsed state of toggle button.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'boolean',
    },
    toggleType: {
        name: 'toggleType',
        type: { name: 'string' },
        description: 'type of toggle button.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_TOGGLE_TYPE.text,
            },
        },
        control: 'select',
        options: Object.values(COLLAPSIBLE_TOGGLE_TYPE),
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for toggle button contents.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    /* event */
    onUpdateIsCollapsed: {
        name: 'update:isCollapsed',
        description: 'Event emitted when collapsed state changed. Works with `v-model` and `isCollapsed` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    default: { table: { disable: true } },
});
