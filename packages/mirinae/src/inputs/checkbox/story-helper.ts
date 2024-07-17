import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getCheckboxArgs = (): Args => ({
    'v-model': [],
    value: true,
    selected: [],
    disabled: false,
    predicate: undefined,
    invalid: false,
    indeterminate: false,
    defaultSlot: 'click me!',
    iconSlot: null,
});

export const getCheckboxParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A162064',
    },
});

export const getCheckboxArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: { name: 'array' } as SBType,
        description: 'Two way binding for `selected` props with `change` event.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'model',
            defaultValue: {
                summary: '[]',
            },
        },
        control: null,
    },
    value: {
        name: 'value',
        description: 'The value to be compared for the \'selected\' props.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: 'object',
    },
    selected: {
        name: 'selected',
        description: 'Selected value(s).',
        table: {
            type: {
                summary: 'any, any[]',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    disabled: {
        name: 'disabled',
        type: 'boolean',
        description: 'Whether to disable selection or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    predicate: {
        name: 'predicate',
        type: 'function',
        description: `Function that predicate two arguments are the same or not.
        It's useful when the props \`value\` is an object.`,
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
    // checkbox props
    invalid: {
        name: 'invalid',
        type: 'boolean',
        description: 'Apply invalid style',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    indeterminate: {
        name: 'indeterminate',
        type: 'boolean',
        description: 'Apply indeterminate style',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot for the additional selectable area that explains checkbox.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    iconSlot: {
        name: 'icon',
        description: 'Slot for custom checkbox icon.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    /* event */
    onChange: {
        name: 'change',
        description: `Event emitted when selected state changed. 
        The first argument is the changed \`selected\` props.
        And the second argument is passed as a boolean value whether or not it is selected.`,
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
    // default
    default: { table: { disable: true } },
    icon: { table: { disable: true } },
});
