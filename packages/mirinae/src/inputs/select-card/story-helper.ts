import type { ArgTypes } from '@storybook/addons';

export const getSelectCardArgTypes = (): ArgTypes => ({
    /* props */
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
    // select card props
    block: {
        name: 'block',
        type: { name: 'boolean' },
        description: 'Make card style to be display block and apply wide style.',
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
    imageUrl: {
        name: 'imageUrl',
        type: { name: 'string' },
        description: 'Card image url. It has a higher render priority than icon props.',
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
    icon: {
        name: 'icon',
        type: { name: 'string, boolean' },
        description: `Card icon.
        It has a lower priority than \`imageUrl\` props.
        So it is rendered only when there is no value in \`imageUrl\` props or when the image load fails.
        If it is \`true\`, default icon will be rendered.`,
        defaultValue: 'img_avatar_admin',
        table: {
            type: {
                summary: 'string, boolean',
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
        description: 'Card icon\'s color.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Card label',
        defaultValue: 'Click Me!',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    tabIndex: {
        name: 'tabIndex',
        type: { name: 'number' },
        description: 'Tab Index, used for keydown event and Web Accessibility',
        defaultValue: 0,
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
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot for card contents.',
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
    bottomSlot: {
        name: 'bottom',
        description: 'Bottom slot for extra contents',
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
