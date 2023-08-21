import type { ArgTypes } from '@storybook/addons';

import { ANIMATION_TYPE } from '@/foundation/icons/config';

export const getSelectStatusArgTypes = (): ArgTypes => ({
    /* props */
    'v-model': {
        name: 'v-model',
        type: { name: 'any' },
        description: 'Two way binding for `value` props with `change` event.',
        defaultValue: '',
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
        type: { name: 'any' },
        description: 'The value to be compared for the \'selected\' props.',
        defaultValue: 'select status',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
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
    // select status props
    icon: {
        name: 'icon',
        type: { name: 'string' },
        description: 'The icon name that represent the status.',
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
    iconColor: {
        name: 'iconColor',
        type: { name: 'string' },
        description: 'The icon color',
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
    iconAnimation: {
        name: 'iconAnimation',
        type: { name: 'string' },
        description: `Icon Animation type. ${Object.values(ANIMATION_TYPE).map((d) => `'${d}'`)} are available.`,
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
            type: 'select',
            options: Object.values(ANIMATION_TYPE),
        },
    },
    disableCheckIcon: {
        name: 'disableCheckIcon',
        type: { name: 'boolean' },
        description: 'Whether to show check icon or not.',
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
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot for text.',
        defaultValue: '',
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
