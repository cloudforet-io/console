import { ArgTypes } from '@storybook/addons';

export const getLabelArgTypes = (): ArgTypes => ({
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Label to display.',
        defaultValue: 'Label',
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
        description: 'Slot for label.',
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
