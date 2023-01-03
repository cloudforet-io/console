import type { ArgTypes } from '@storybook/addons';

// eslint-disable-next-line import/no-cycle
import { getContextMenuArgTypes } from '@/inputs/context-menu/story-helper';

const initContextMenuArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();
    // eslint-disable-next-line max-len
    contextMenuArgTypes.loading.description = 'Use this prop to display loading animation from the drop-down menu.<br/>This `loading` works when `disableHandler` is `true`.<br/>(Already implemented for injected handlers internally.)';
    const argTypes: ArgTypes = {
        menu: contextMenuArgTypes.menu,
        loading: contextMenuArgTypes.loading,
    };
    return argTypes;
};

export const getSearchSlotArgTypes = (): ArgTypes => ({
    left: {
        name: 'left',
        description: 'A slot for insert something into left side of input element.',
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
        description: 'A slot for replace input element. Use it carefully and don\'t forget bind props and event handlers that provided by slot props.',
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
        description: 'A slot for replace right side of input element including delete button.',
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
});

export const getSearchArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = initContextMenuArgTypes();
    return ({
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
        disabled: {
            name: 'disabled',
            type: { name: 'boolean' },
            description: 'Whether to disable search or not.',
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
        readonly: {
            name: 'readonly',
            type: { name: 'boolean' },
            description: 'Whether to make input readonly.',
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
        visibleMenu: {
            name: 'visibleMenu',
            type: { name: 'boolean' },
            description: 'Use this prop when you want to control menu visibility manually. this is `sync` prop with event `update:visible-menu`.',
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
        useFixedMenuStyle: {
            name: 'useFixedMenuStyle',
            type: { name: 'boolean' },
            description: 'Whether to use position fixed style on menu or not. ',
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
        ...contextMenuArgTypes,
        handler: {
            name: 'handler',
            type: { name: 'function' },
            description: 'Handler that returns auto-completion menu according to input value. If no value is given, the default handler is executed.',
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'function',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: null,
        },
        disableHandler: {
            name: 'disableHandler',
            type: { name: 'boolean' },
            description: 'Whether to use handler or not.',
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
        useAutoComplete: {
            name: 'useAutoComplete',
            type: { name: 'boolean' },
            description: 'Whether to use autocomplete or not.',
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
        // attrs
        inputAttrs: {
            name: 'all input attributes',
            description: 'All input attributes are allowed. e.g. type',
            defaultValue: {},
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'attrs',
            },
            control: {
                type: 'object',
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
        ...getSearchSlotArgTypes(),
        /* events */
        onInput: {
            name: 'input',
            description: 'Emitted when input occurred.',
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
        onInputNativeEvents: {
            name: 'input native events',
            description: 'Emitted when input native events occurred.',
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
};
