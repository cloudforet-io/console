import type { ArgTypes } from '@storybook/addons';

export const getVerticalLayoutArgTypes = (): ArgTypes => ({
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'Height of layout.',
        defaultValue: '100%',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"100%"',
            },
        },
        control: {
            type: 'text',
        },
    },
    initWidth: {
        name: 'initWidth',
        type: { name: 'number' },
        description: '',
        defaultValue: 300,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '300',
            },
        },
        control: {
            type: 'number',
        },
    },
    minWidth: {
        name: 'minWidth',
        type: { name: 'number' },
        description: '',
        defaultValue: 100,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '100',
            },
        },
        control: {
            type: 'number',
        },
    },
    maxWidth: {
        name: 'maxWidth',
        type: { name: 'number' },
        description: '',
        defaultValue: 500,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '500',
            },
        },
        control: {
            type: 'number',
        },
    },
});
