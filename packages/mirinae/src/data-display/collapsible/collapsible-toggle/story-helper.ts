import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';

export const getCollapsibleToggleArgTypes = () => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: 'boolean',
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
        type: 'boolean',
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
        type: 'string',
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
        type: 'string',
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
});
