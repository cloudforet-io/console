import { ArgTypes } from '@storybook/addons';
import { CONTEXT_MENU_THEME } from '@/inputs/context-menu/type';

const slots: [string, string][] = [
    ['no-data-format', '`no-data` slot with default style applied'],
    // eslint-disable-next-line max-len
    ['menu', 'This is a slot that allows you to customize a menu, and it is useful when you want to use only the functions of the context menu, but use it completely differently from the basic style.'],
    ['item--format', 'Slot used when customizing all menu items whose type is \'item\' with default style applied'],
    ['header-<item.name>', 'Slot used when customizing a specific menu item whose type is \'header\''],
    ['help-text', 'Slot used when you want to put additional information on the top'],
];

const events: [string, string][] = [
    ['<item.name>:select', 'This event is emitted when a specific item is selected. As arguments, index and click event are passed. This event will be deprecated, so don\'t use it.'],
    ['select', 'This event is emitted when a specific item is selected. As arguments, item name and index are passed'],
    ['focus', 'This event is emitted when item is focused. As arguments, index of item is passed'],
    ['blur', 'This event is emitted when item is blurred.'],
    ['keyup:up:end', 'This event is emitted when a menu item is tracked through the arrow up key, and the down key is pressed at the first menu item.'],
    ['keyup:down:end', 'This event is emitted when a menu item is tracked through the arrow down key, and the down key is pressed at the last menu item.'],
    ['keyup:esc', 'This event is emitted when a esc key is pressed.'],
];

const getArgTypes = (category: string, info: [string, string][]) => {
    const argTypes: ArgTypes = {};
    info.forEach(([argName, argDescription]) => {
        let name = argName;
        if (category === 'slots') name = `${argName}Slot`;
        else if (category === 'events') name = `on${argName[0].toUpperCase()}${argName.slice(1)}`;
        argTypes[name] = {
            name: argName,
            description: argDescription,
            defaultValue: null,
            table: {
                type: {
                    summary: null,
                },
                category,
                defaultValue: {
                    summary: null,
                },
            },
        };
    });
    return argTypes;
};

export const getContextMenuArgTypes = (): ArgTypes => ({
    menu: {
        name: 'menu',
        type: { name: 'array' },
        description: 'Menu items',
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
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: `Theme for context menu. ${Object.values(CONTEXT_MENU_THEME)} are available.`,
        defaultValue: CONTEXT_MENU_THEME.secondary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: CONTEXT_MENU_THEME.secondary,
            },
        },
        control: {
            type: 'select',
            options: Object.values(CONTEXT_MENU_THEME),
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Loading state.',
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
    alwaysShowMenu: {
        name: 'alwaysShowMenu',
        type: { name: 'boolean' },
        description: 'Show menu always even if there is no menu to show.',
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
    selected: {
        name: 'selected',
        type: { name: 'array' },
        description: 'Array of selected menu item.',
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
    multiSelectable: {
        name: 'multiSelectable',
        type: { name: 'boolean' },
        description: 'Whether to select multiple items or not.',
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
    showRadioIcon: {
        name: 'showRadioIcon',
        type: { name: 'boolean' },
        description: 'Whether to show radio button icon or not.',
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
    showSelectedList: {
        name: 'showSelectedList',
        type: { name: 'boolean' },
        description: 'Whether to show selected list or not.',
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
    showSelectAll: {
        name: 'showSelectAll',
        type: { name: 'boolean' },
        description: 'Whether to show \'Select All\' item at the top of the menu.',
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
    ...getArgTypes('slots', slots),
    ...getArgTypes('events', events),
});
