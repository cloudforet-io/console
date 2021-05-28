import { ArgTypes } from '@storybook/addons';

export const argTypes: ArgTypes = {
    value: {
        name: 'value',
        type: { name: 'any' },
        description: 'The value to be compared for the \'selected\' props.',
        defaultValue: true,
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'object',
        },
    },
    selected: {
        name: 'selected',
        type: { name: 'any, any[]' },
        description: 'Selected value(s).',
        defaultValue: [],
        table: {
            type: {
                summary: 'any, any[]',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Whether to disable selection or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    predicate: {
        name: 'predicate',
        type: { name: 'func' },
        description: `Function that predicate two arguments are the same or not.
        It's useful when the props \`value\` is an object.`,
        defaultValue: undefined,
        table: {
            type: {
                summary: 'func',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: null,
    },
    onChange: {
        name: 'change',
        description: 'Event emitted when selected state changed.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
};
