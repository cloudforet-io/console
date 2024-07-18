import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getRadioArgs = (): Args => ({
    'v-model': [],
    value: true,
    selected: undefined,
    disabled: false,
    predicate: undefined,
    invalid: false,
    readonly: false,
    defaultSlot: 'click me!',
    radioIconSlot: null,
    radioLeftSlot: null,
});

export const getRadioParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6169%3A162064',
    },
});

export const getRadioArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
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
                summary: 'undefined',
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
    // radio props
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
    readonly: {
        name: 'readonly',
        type: 'boolean',
        description: 'Whether to make readonly or not',
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
        defaultValue: 'click me!',
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
    radioIconSlot: {
        name: 'radio-icon',
        description: 'Slot for custom radio icon.',
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
        control: 'text',
    },
    radioLeftSlot: {
        name: 'radio-left',
        description: 'Slot for left area of radio.',
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
    'radio-left': { table: { disable: true } },
    icon: { table: { disable: true } },
});
