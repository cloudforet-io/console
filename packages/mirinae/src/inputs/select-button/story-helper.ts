import type { ArgTypes } from '@storybook/addons';

import { SELECT_BUTTON_SIZE, SELECT_BUTTON_STYLE_TYPE } from '@/inputs/select-button/config';

export const getSelectButtonArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: { name: 'any' },
        description: 'Two way binding for `selected` props with `change` event.',
        defaultValue: [],
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
        defaultValue: undefined,
        table: {
            type: {
                summary: 'any, any[]',
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
    multiSelectable: {
        name: 'multiSelectable',
        type: { name: 'boolean' },
        description: 'Whether to allow multi select or not.',
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
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Style type of select button. ${Object.values(SELECT_BUTTON_STYLE_TYPE)} are available.`,
        defaultValue: SELECT_BUTTON_STYLE_TYPE.secondary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_BUTTON_STYLE_TYPE.secondary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SELECT_BUTTON_STYLE_TYPE),
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Size of select button. ${Object.values(SELECT_BUTTON_SIZE)} are available.`,
        defaultValue: SELECT_BUTTON_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: SELECT_BUTTON_SIZE.md,
            },
        },
        control: {
            type: 'select',
            options: Object.values(SELECT_BUTTON_SIZE),
        },
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
        control: {
            type: 'text',
        },
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
    onUpdateSelected: {
        name: 'update:selected',
        description: 'Event emitted when selected state is changed.',
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
});
