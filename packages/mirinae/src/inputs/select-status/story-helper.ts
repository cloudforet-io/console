import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { ANIMATION_TYPE } from '@/foundation/icons/config';

export const getSelectStatusArgs = (): Args => ({
    'v-model': '',
    value: 'select status',
    selected: undefined,
    predicate: undefined,
    multiSelectable: false,
    icon: undefined,
    iconColor: undefined,
    iconAnimation: undefined,
    disableCheckIcon: false,
    defaultSlot: '',
});

export const getSelectStatusParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getSelectStatusArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        description: 'Two way binding for `value` props with `change` event.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'model',
            defaultValue: {
                summary: '',
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
                summary: '""',
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
    multiSelectable: {
        name: 'multiSelectable',
        type: 'boolean',
        description: 'Whether to allow multi select or not.',
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
    // select status props
    icon: {
        name: 'icon',
        type: 'string',
        description: 'The icon name that represent the status.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    iconColor: {
        name: 'iconColor',
        type: 'string',
        description: 'The icon color',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    iconAnimation: {
        name: 'iconAnimation',
        type: 'string',
        description: `Icon Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'select',
        options: Object.values(ANIMATION_TYPE),
    },
    disableCheckIcon: {
        name: 'disableCheckIcon',
        type: 'boolean',
        description: 'Whether to show check icon or not.',
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
        description: 'Slot for text.',
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
});
