import type { ArgTypes } from '@storybook/addons';

export const getHorizontalLayoutArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: { name: 'number' },
        description: '',
        defaultValue: 400,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"400"',
            },
        },
        control: {
            type: 'number',
        },
    },
    minHeight: {
        name: 'minHeight',
        type: { name: 'number' },
        description: '',
        defaultValue: 300,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"300"',
            },
        },
        control: {
            type: 'number',
        },
    },
    maxHeight: {
        name: 'maxHeight',
        type: { name: 'number' },
        description: '',
        defaultValue: 1000,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '"1000"',
            },
        },
        control: {
            type: 'number',
        },
    },

    // slots
    container: {
        name: 'container',
        description: 'Slot for layout contents.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },

    // events
    onResizeEnd: {
        name: 'resize-end',
        description: 'Emitted when resizing is end.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
});
