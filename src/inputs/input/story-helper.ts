import type { ArgTypes } from '@storybook/addons';

import { getContextMenuArgTypes } from '@/inputs/context-menu/story-helper';
import { INPUT_SIZE } from '@/inputs/input/type';

const initContextMenuArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();
    const argTypes: ArgTypes = {
        menu: contextMenuArgTypes.menu,
        loading: contextMenuArgTypes.loading,
    };
    return argTypes;
};

export const getTextInputArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = initContextMenuArgTypes();
    return {
        value: {
            name: 'value',
            type: { name: 'string, number', required: false },
            description: 'Input value',
            defaultValue: '',
            table: {
                type: {
                    summary: 'string, number',
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
        disabled: {
            name: 'disabled',
            type: { name: 'boolean' },
            description: 'The same with disabled attribute.',
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
        block: {
            name: 'block',
            type: { name: 'boolean' },
            description: 'Make input style to be display block',
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
        invalid: {
            name: 'invalid',
            type: { name: 'boolean' },
            description: 'Apply invalid style',
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
        multiInput: {
            name: 'multiInput',
            type: { name: 'boolean' },
            description: 'Whether to enable multi input mode or not.',
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
        selected: {
            name: 'selected',
            type: { name: 'array' },
            description: 'Selected menu items. this is `sync` prop with `update:selected` event.',
            defaultValue: [],
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
            control: {
                type: 'object',
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
        exactMode: {
            name: 'exactMode',
            type: { name: 'boolean' },
            description: 'If it is `true` and there is no exact match for the menu item, the search text will be blank.',
            defaultValue: true,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'true',
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
        maskingMode: {
            name: 'maskingMode',
            type: { name: 'boolean' },
            description: 'Whether to use input masking or not.',
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
        showPassword: {
            name: 'showPassword',
            type: { name: 'boolean' },
            description: 'Whether to display password or not.',
            defaultValue: true,
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: 'true',
                },
            },
            control: {
                type: 'boolean',
            },
        },
        size: {
            name: 'size',
            type: { name: 'string' },
            description: `TextInput size. ${Object.values(INPUT_SIZE)} are available.`,
            defaultValue: INPUT_SIZE.md,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: `"${INPUT_SIZE.md}"`,
                },
            },
            control: {
                type: 'select',
                options: Object.values(INPUT_SIZE),
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
        // model
        'v-model': {
            name: 'v-model',
            type: { name: 'string, number', required: false },
            description: 'Two way binding for `value` props with `input` event.',
            defaultValue: '',
            table: {
                type: {
                    summary: 'string, number',
                },
                category: 'model',
                defaultValue: {
                    summary: '',
                },
            },
            control: null,
        },
        // slots
        defaultSlot: {
            name: 'default',
            description: 'Slot for input element. Use it if you want to customize input element but if you use this slot, you may lose some of features of this component.',
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
            control: null,
        },
        rightExtraSlot: {
            name: 'right-extra',
            description: 'Slot for right area of input. This slot will be deprecated.',
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
        inputRightSlot: {
            name: 'input-right',
            description: 'Slot on the right next to the input.',
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
        rightEdgeSlot: {
            name: 'right-edge',
            description: 'Slot on the right edge of the input.',
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
        // events
        onInput: {
            name: 'input',
            description: 'Event emitted when input something. Works with v-model.',
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
        onUpdateVisibleMenu: {
            name: 'update:visible-menu',
            description: 'Event emitted when menu visibility is updated.',
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
            description: 'Event emitted when selected items are updated.',
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
        onInputEvents: {
            name: 'all input events',
            description: 'All Events emitted from input element',
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
    };
};
