import { ArgTypes } from '@storybook/addons';

export const getPanelTopArgTypes = (): ArgTypes => ({
    useTotalCount: {
        name: 'useTotalCount',
        type: { name: ' boolean' },
        description: 'Whether to display total count or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    totalCount: {
        name: 'totalCount',
        type: { name: ' number' },
        description: 'Total count value to display next to the title.',
        defaultValue: 0,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: {
            type: 'number',
        },
    },
    title: {
        name: 'title',
        type: { name: ' string' },
        description: 'The title to display.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for replacing title.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    extraSlot: {
        name: 'extra',
        description: 'Slot for right extra space of title.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
});
