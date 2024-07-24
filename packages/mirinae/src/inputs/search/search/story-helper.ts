import type { ArgTypes, Args, Parameters } from '@storybook/vue';

// eslint-disable-next-line import/no-cycle
import { getContextMenuArgTypes, getContextMenuArgs } from '@/inputs/context-menu/story-helper';
import { getSearchSlotArgTypes } from '@/inputs/story-helper';

export const getSearchParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5952%3A1343',
    },
});

const initContextMenuArgs = (): Args => {
    const contextMenuArgs = getContextMenuArgs();

    const args: Args = {
        menu: contextMenuArgs.menu,
        loading: contextMenuArgs.loading,
    };
    return args;
};

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

export const getSearchArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = initContextMenuArgTypes();
    return ({
        value: {
            name: 'value',
            type: { name: 'string', required: true },
            description: 'Input value. Supported with v-model and sync for two way binding.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '',
                },
            },
            control: 'text',
        },
        placeholder: {
            name: 'placeholder',
            type: { name: 'string' },
            description: 'Input placeholder.',
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
        disableIcon: {
            name: 'disableIcon',
            type: { name: 'boolean' },
            description: 'Hide search icon.',
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
        isFocused: {
            name: 'isFocused',
            type: { name: 'boolean' },
            description: 'focused value for sync.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: null,
                },
            },
            control: 'boolean',
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
            control: 'boolean',
        },
        disabled: {
            name: 'disabled',
            type: { name: 'boolean' },
            description: 'Whether to disable search or not.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        readonly: {
            name: 'readonly',
            type: { name: 'boolean' },
            description: 'Whether to make input readonly.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        visibleMenu: {
            name: 'visibleMenu',
            type: { name: 'boolean' },
            description: 'Use this prop when you want to control menu visibility manually. this is `sync` prop with event `update:visible-menu`.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        useFixedMenuStyle: {
            name: 'useFixedMenuStyle',
            type: { name: 'boolean' },
            description: 'Whether to use position fixed style on menu or not. ',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        ...contextMenuArgTypes,
        handler: {
            name: 'handler',
            type: { name: 'function' },
            description: 'Handler that returns auto-completion menu according to input value. If no value is given, the default handler is executed.',
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
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        useAutoComplete: {
            name: 'useAutoComplete',
            type: { name: 'boolean' },
            description: 'Whether to use autocomplete or not.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'false',
                },
            },
            control: 'boolean',
        },
        // attrs
        inputAttrs: {
            name: 'all input attributes',
            description: 'All input attributes are allowed. e.g. type',
            table: {
                type: {
                    summary: null,
                },
                defaultValue: {
                    summary: null,
                },
                category: 'attrs',
            },
            control: 'object',
        },
        /* model */
        'v-model': {
            name: 'v-model',
            type: { name: 'string', required: false },
            description: 'model of \'value\' props and \'update:value\' event.',
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


const getSearchSlotArgs = (): Args => ({
    left: null,
    default: null,
    right: null,
});

export const getSearchArgs = (): Args => {
    const contextMenuArgs = initContextMenuArgs();

    return {
        value: '',
        placeholder: undefined,
        disableIcon: false,
        isFocused: false,
        invalid: false,
        disabled: false,
        readonly: false,
        visibleMenu: false,
        useFixedMenuStyle: false,
        ...contextMenuArgs,
        handler: undefined,
        disableHandler: false,
        useAutoComplete: false,
        inputAttrs: {},
        'v-model': null,
        ...getSearchSlotArgs(),
    };
};
