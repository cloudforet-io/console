import { ArgTypes } from '@storybook/addons';

export const getSearchArgTypes = (): ArgTypes => ({
    value: {
        name: 'value',
        type: { name: 'string', required: true },
        description: 'Input value. Supported with v-model and sync for two way binding.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
    },
    placeholder: {
        name: 'placeholder',
        type: { name: 'string' },
        description: 'Input placeholder.',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: {
            type: 'text',
        },
    },
    disableIcon: {
        name: 'disableIcon',
        type: { name: 'boolean' },
        description: 'Hide search icon.',
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
    isFocused: {
        name: 'isFocused',
        type: { name: 'boolean' },
        description: 'focused value for sync.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* model */
    'v-model': {
        name: 'v-model',
        type: { name: 'string' },
        description: 'model of \'value\' props and \'update:value\' event.',
        defaultValue: null,
        table: {
            type: {
                summary: 'string',
            },
            category: 'model',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    /* slots */
    left: {
        name: 'left',
        description: 'Slot for insert something into left side of input element.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    default: {
        name: 'default',
        description: `Slot for replace input element.
                      Use it carefully and don't forget bind props and event handlers that provided by slot props.`,
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    right: {
        name: 'right',
        description: 'Slot for replace right side of input element including delete button.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
            defaultValue: {
                summary: null,
            },
        },
    },
    onInput: {
        name: 'input',
        description: 'Emitted when input occurred.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onSearch: {
        name: 'search',
        description: 'Emitted when input keyup.enter event occurred.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onDelete: {
        name: 'delete',
        description: 'Emitted when delete button clicked.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onFocus: {
        name: 'focus',
        description: 'Emitted when input focused.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    onBlur: {
        name: 'blur',
        description: 'Emitted when input blurred.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
    inputNativeEvents: {
        name: 'input native events',
        description: 'Emitted when input native events occurred.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'events',
            defaultValue: {
                summary: null,
            },
        },
    },
});
