import type { ArgTypes } from '@storybook/addons';

export const getLabelArgTypes = (): ArgTypes => ({
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'text to display.',
        defaultValue: 'Field Title',
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
    description: {
        name: 'description',
        type: { name: 'string' },
        description: 'description for the title.',
        defaultValue: 'description for the title!',
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
        description: 'Slot for field-title.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});
