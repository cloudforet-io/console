import { ArgTypes } from '@storybook/addons';

export const argTypes: ArgTypes = {
    header: {
        name: 'header',
        type: { name: 'string' },
        description: 'Card header',
        defaultValue: 'This is header!',
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
    defaultSlot: {
        name: 'default',
        description: 'Slot for card body.',
        defaultValue: 'This is card body!',
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
    headerSlot: {
        name: 'header',
        description: 'Slot for card header.',
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
};
