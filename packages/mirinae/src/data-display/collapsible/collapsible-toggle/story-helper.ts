import type { ArgTypes } from '@storybook/addons';

import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';


export const getCollapsibleToggleArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: { name: 'boolean' },
        description: 'Two way binding for `isCollapsed` props with `update:isCollapsed` event.',
        defaultValue: '',
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
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    toggleType: {
        name: 'toggleType',
        type: { name: 'string' },
        description: 'type of toggle button.',
        defaultValue: COLLAPSIBLE_TOGGLE_TYPE.text,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_TOGGLE_TYPE.text,
            },
        },
        control: {
            type: 'select',
            options: Object.values(COLLAPSIBLE_TOGGLE_TYPE),
        },
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for toggle button contents.',
        defaultValue: 'Show',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    /* event */
    onUpdateIsCollapsed: {
        name: 'update:is-collapsed',
        description: 'Event emitted when collapsed state changed. Works with `v-model:is-collapsed`.',
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
});
