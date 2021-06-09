import { ArgTypes } from '@storybook/addons';

export const argTypes: ArgTypes = {
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
    onUpdateIsCollapsed: {
        name: 'update:isCollapsed',
        description: 'Event emitted when collapsed state changed. Works with `v-model` and `isCollapsed` props sync.',
        defaultValue: null,
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
};
