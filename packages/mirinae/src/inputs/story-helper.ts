import type { ArgTypes } from '@storybook/vue';

export const getSearchSlotArgTypes = (): ArgTypes => ({
    left: {
        name: 'left',
        description: 'A slot for insert something into left side of input element.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    default: {
        name: 'default',
        description: 'A slot for replace input element. Use it carefully and don\'t forget bind props and event handlers that provided by slot props.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    right: {
        name: 'right',
        description: 'A slot for replace right side of input element including delete button.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
});
