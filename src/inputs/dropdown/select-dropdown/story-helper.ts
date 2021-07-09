import { camelCase } from 'lodash';
import { ArgTypes } from '@storybook/addons';
import { getContextMenuFixedStyleArgTypes } from '@/hooks/context-menu-fixed-style/story-helper';
import { menuItems } from '@/inputs/context-menu/mock';
import { getContextMenuArgTypes } from '@/inputs/context-menu/story-helper';
import { BUTTON_STYLE } from '@/inputs/buttons/button/type';

export const getSelectDropdownArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();

    const contextMenuSlots = {};
    Object.keys(contextMenuArgTypes).forEach((k) => {
        const argType = contextMenuArgTypes[k];
        if (argType.table?.category === 'slots') {
            argType.name = `menu-${argType.name}`;
            contextMenuSlots[`menu${camelCase(k)}`] = argType;
        }
    });
    return {
        ...getContextMenuFixedStyleArgTypes(),
        invalid: contextMenuArgTypes.invalid,
        loading: contextMenuArgTypes.loading,
        alwaysShowMenu: contextMenuArgTypes.alwaysShowMenu,
        items: {
            name: 'items',
            type: { name: 'array' },
            description: 'Dropdown menu items. It is the same as the menu format of the context menu component.',
            defaultValue: menuItems,
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
        selected: {
            name: 'selected',
            type: { name: 'string, number' },
            description: 'Selected item\'s name or index(when `indexMode` props is `true`. Two way binding with `sync` is available.',
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'string, number',
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
            name: 'loading',
            type: { name: 'boolean' },
            description: 'Whether to disable dropdown selection or not.',
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
        indexMode: {
            name: 'indexMode',
            type: { name: 'boolean' },
            description: 'Whether to `selected` props works with item\'s index or not.',
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
        placeholder: {
            name: 'placeholder',
            type: { name: 'string' },
            description: 'Placeholder for dropdown button.',
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
        buttonOnly: {
            name: 'buttonOnly',
            type: { name: 'boolean' },
            description: 'Whether to only use icon button or not.',
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
        withoutOutline: {
            name: 'withoutOutline',
            type: { name: 'boolean' },
            description: 'Whether to show outline or not.',
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
        buttonStyleType: {
            name: 'buttonStyleType',
            type: { name: 'string' },
            description: `Button style. Useful when \`buttonOnly\` props is \`true\`. \n${
                ['undefined', ...Object.values(BUTTON_STYLE)].map(d => `\`${d}\``)} are available.`,
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
                options: [undefined, ...Object.values(BUTTON_STYLE)],
            },
        },
        buttonIcon: {
            name: 'buttonIcon',
            type: { name: 'string' },
            description: 'Icons for dropdown right button. Useful when `buttonOnly` props is `true`.',
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
        /* model */
        'v-model': {
            name: 'v-model',
            type: { name: 'string, number' },
            description: 'Two way binding for `selected` props with `update:selected` event.',
            defaultValue: undefined,
            table: {
                type: {
                    summary: 'string, number',
                },
                category: 'model',
                defaultValue: {
                    summary: 'undefined',
                },
            },
            control: null,
        },
        /* slots */
        ...contextMenuSlots,
        defaultSlot: {
            name: 'default',
            description: 'Slot for dropdown button text. Default value is placeholder or selected item\'s label.',
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
        },
        /* events */
        onSelect: {
            name: 'select',
            description: 'Event emitted when menu item was selected.',
            defaultValue: null,
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
            description: 'Event emitted when menu item was selected. works with `selected` props sync.',
            defaultValue: null,
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
        onFocusMenu: {
            name: 'focus-menu',
            description: 'Event emitted when menu must be focused, but there are no menu items to focus because `menu-menu` slot was given.',
            defaultValue: null,
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
