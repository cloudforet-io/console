import type { Args, ArgTypes, Parameters } from '@storybook/vue';

export const getSliderArgs = (): Args => ({
});

export const getSliderParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: '',
    },
});

export const getSliderArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        description: 'The value for slider content.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '50',
            },
        },
        control: 'number',
    },
    min: {
        name: 'min',
        description: 'The min value for slider.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '0',
            },
        },
        control: 'number',
    },
    max: {
        name: 'max',
        description: 'The max value for slider.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: '100',
            },
        },
        control: 'number',
    },
    showInput: {
        name: 'showInput',
        description: 'Whether to show input box or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: '"false"',
            },
        },
        control: 'boolean',
    },
});
