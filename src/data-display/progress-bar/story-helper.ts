import { ArgTypes } from '@storybook/addons';

export const getProgressBarArgTypes = (): ArgTypes => ({
    percentage: {
        name: 'percentage',
        type: { name: 'number' },
        description: 'Progress percentage',
        defaultValue: 50,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
        },
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Label text',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'text',
        },
    },
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'Color of tracker bar',
        defaultValue: 'undefined',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'color',
        },
    },
    gradient: {
        name: 'gradient',
        type: { name: 'object' },
        description: 'Gradient Color & Gradient Starting point of tracker bar.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'object',
        },
    },
});
