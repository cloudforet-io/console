import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getContextMenuArgTypes, getContextMenuArgs } from '@/inputs/context-menu/story-helper';
import { INPUT_APPEARANCE_TYPES, INPUT_SIZE } from '@/inputs/input/text-input/type';

const initContextMenuArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();
    const argTypes: ArgTypes = {
        menu: contextMenuArgTypes.menu,
        loading: contextMenuArgTypes.loading,
    };
    return argTypes;
};

const initContextMenuArgs = (): Args => {
    const contextMenuArgs = getContextMenuArgs();
    const args: Args = {
        menu: contextMenuArgs.menu,
        loading: contextMenuArgs.loading,
    };

    return args;
};

export const getTextInputArgs = (): Args => {
    const contextMenuArgs = initContextMenuArgs();

    return {
        value: '',
        size: INPUT_SIZE.md,
        isFocused: false,
        ...contextMenuArgs,
        disabled: false,
        block: false,
        invalid: false,
        placeholder: undefined,
        multiInput: false,
        selected: [],
        visibleMenu: false,
        useFixedMenuStyle: false,
        disableHandler: false,
        useAutoComplete: false,
        maskingMode: false,
        showPassword: true,
        appearanceType: INPUT_APPEARANCE_TYPES[0],
        pageSize: 10,
        inputAttrs: {},
        'v-model': '',
        defaultSlot: null,
        rightExtraSlot: '',
        inputRightSlot: '',
        rightEdgeSlot: '',
    };
};

export const getTextInputParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5191%3A2',
    },
});

export const getTextInputArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = initContextMenuArgTypes();
    return {
        value: {
            name: 'value',
            type: { name: 'string', required: false },
            description: 'Input value',
            table: {
                type: {
                    summary: 'string, number',
                },
                category: 'props',
                defaultValue: {
                    summary: '',
                },
            },
            control: 'text',
        },
        size: {
            name: 'size',
            type: { name: 'string' },
            description: `TextInput size. ${Object.values(INPUT_SIZE)} are available.`,
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: `"${INPUT_SIZE.md}"`,
                },
            },
            control: 'select',
            options: Object.values(INPUT_SIZE),
        },
        type: {
            name: 'type',
            type: { name: 'string' },
            description: 'Input Tag type. `text`, `password`, `number`, `email`, `tel`, `url`, `search`, `date`, `time`, `datetime-local`, `month`, `week` are available.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: 'text',
                },
            },
            control: 'select',
            options: ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'time', 'datetime-local', 'month', 'week'],
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
        disabled: {
            name: 'disabled',
            type: { name: 'boolean' },
            description: 'The same with disabled attribute.',
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
        block: {
            name: 'block',
            type: { name: 'boolean' },
            description: 'Make input style to be display block',
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
        invalid: {
            name: 'invalid',
            type: { name: 'boolean' },
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
        multiInput: {
            name: 'multiInput',
            type: { name: 'boolean' },
            description: 'Whether to enable multi input mode or not.',
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
        selected: {
            name: 'selected',
            type: { name: 'array' } as SBType,
            description: 'Selected menu items. this is `sync` prop with `update:selected` event.',
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
            control: 'object',
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
        maskingMode: {
            name: 'maskingMode',
            type: { name: 'boolean' },
            description: 'Whether to use input masking or not.',
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
            control: 'boolean',
        },
        appearanceType: {
            name: 'appearanceType',
            type: { name: 'string' },
            description: 'Appearance type to display selected items.',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: `'${INPUT_APPEARANCE_TYPES[0]}'`,
                },
            },
            control: 'select',
            options: INPUT_APPEARANCE_TYPES,
        },
        pageSize: {
            name: 'pageSize',
            type: { name: 'number' },
            description: 'Page size to show items.',
            table: {
                type: {
                    summary: 'number',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: { type: 'number', min: 0 },
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
        // model
        'v-model': {
            name: 'v-model',
            required: false,
            description: 'Two way binding for `value` props with `input` event.',
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
        inputRightSlot: {
            name: 'input-right',
            description: 'Slot on the right next to the input.',
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
        rightEdgeSlot: {
            name: 'right-edge',
            description: 'Slot on the right edge of the input.',
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
        // events
        onUpdateValue: {
            name: 'update:value',
            description: 'Event emitted when value is updated. Works with v-model, sync.',
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
        onUpdateIsFocused: {
            name: 'update:is-focused',
            description: 'Event emitted when focused state is updated. Works with isFocused prop sync.',
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
        onUpdate: {
            name: 'update',
            description: 'Event emitted when selected and duplication check validation is updated. '
                + 'Selected items are for the first argument, and validation result(boolean) is for the second argument. ',
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
        // default
        default: { table: { disable: true } },
        'right-extra': { table: { disable: true } },
        'input-right': { table: { disable: true } },
        'right-edge': { table: { disable: true } },
    };
};
