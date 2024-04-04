import type { ArgTypes } from '@storybook/addons';

export const getCenteredLayoutArgTypes = (): ArgTypes => ({
    // slots
    defaultSlot: {
        name: 'default',
        description: 'Slot for layout contents.',
        defaultValue: 'This is contents',
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
    topContentsSlot: {
        name: 'top-contents',
        description: 'Slot for top contents.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: null,
    },
});
