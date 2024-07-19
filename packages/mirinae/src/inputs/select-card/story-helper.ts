import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getSelectCardArgs = (): Args => ({
    value: true,
    'v-model': '',
    selected: undefined,
    disabled: false,
    predicate: undefined,
    multiSelectable: false,
    block: false,
    imageUrl: undefined,
    icon: 'img_avatar_admin',
    iconColor: '',
    label: 'Click Me!',
    tabIndex: 0,
    defaultSlot: '',
    bottomSlot: '',
});

export const getSelectCardParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=13512%3A300523',
    },
});

export const getSelectCardArgTypes = (): ArgTypes => ({
    /* props */
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
        type: { name: 'boolean' },
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
        type: { name: 'function' },
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
        type: { name: 'boolean' },
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
    // select card props
    block: {
        name: 'block',
        type: { name: 'boolean' },
        description: 'Make card style to be display block and apply wide style.',
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
    imageUrl: {
        name: 'imageUrl',
        type: { name: 'string' },
        description: 'Card image url. It has a higher render priority than icon props.',
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
    icon: {
        name: 'icon',
        description: `Card icon.
        It has a lower priority than \`imageUrl\` props.
        So it is rendered only when there is no value in \`imageUrl\` props or when the image load fails.
        If it is \`true\`, default icon will be rendered.`,
        table: {
            type: {
                summary: 'string, boolean',
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
        type: { name: 'string' },
        description: 'Card icon\'s color.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Card label',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    tabIndex: {
        name: 'tabIndex',
        type: { name: 'number' },
        description: 'Tab Index, used for keydown event and Web Accessibility',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
    },
    /* slot */
    defaultSlot: {
        name: 'default',
        description: 'Slot for card contents.',
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
    bottomSlot: {
        name: 'bottom',
        description: 'Bottom slot for extra contents',
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
    bottom: { table: { disable: true } },
});
