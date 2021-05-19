import { ArgTypes } from '@storybook/addons';
import { CONTEXT_MENU_POSITION, CONTEXT_MENU_THEME } from '@/inputs/context-menu/type';

const slots: [string, string][] = [
    ['no-data', 'Slot for customizing the content to be displayed on the menu when there is no menu item'],
    ['no-data-format', '`no-data` slot with default style applied'],
    // eslint-disable-next-line max-len
    ['menu', 'This is a slot that allows you to customize a menu, and it is useful when you want to use only the functions of the context menu, but use it completely differently from the basic style.'],
    ['item', 'Slot used when customizing all menu items whose type is \'item\''],
    ['item--format', 'Slot used when customizing all menu items whose type is \'item\' with default style applied'],
    ['item-<item.name>', 'Slot used when customizing a specific menu item whose type is \'item\''],
    ['item-<item.name>-format', 'Slot used when customizing a specific menu item whose type is \'item\' with default style applied'],
    ['info', 'Slot used when customizing all menu items whose type is \'info\''],
    ['info--format', 'Slot used when customizing all menu items whose type is \'info\' with default style applied'],
    ['divider', 'Slot used when customizing all menu items whose type is \'divider\''],
    ['divider-<item.name>', 'Slot used when customizing a specific menu item whose type is \'divider\''],
    ['header', 'Slot used when customizing all menu items whose type is \'header\''],
    ['header--format', 'Slot used when customizing all menu items whose type is \'header\' with default style applied'],
    ['header-<item.name>', 'Slot used when customizing a specific menu item whose type is \'header\''],
    ['header-<item.name>-format', 'Slot used when customizing a specific menu item whose type is \'header\' with default style applied'],
    ['loading', 'Slot for customizing the loader'],
    ['loading-format', 'Slot for customizing the loader with default style applied'],
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

export const argTypes: ArgTypes = {
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
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    autoHeight: {
        name: 'autoHeight',
        type: { name: 'boolean' },
        description: 'If you don\'t want the context menu to be long enough to go outside the window area, set this value to true.',
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
    useCustomStyle: {
        name: 'useCustomStyle',
        type: { name: 'boolean' },
        description: 'Only when this value is true, style can be customized using width, height, offsetTop, and position props.',
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
    position: {
        name: 'position',
        type: { name: 'string' },
        description: `Menu position. ${Object.values(CONTEXT_MENU_POSITION)} are available.`,
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
            options: [undefined, ...Object.values(CONTEXT_MENU_POSITION)],
        },
    },
    offsetTop: {
        name: 'offsetTop',
        type: { name: 'number' },
        description: 'Menu offsetTop(px).',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    width: {
        name: 'width',
        type: { name: 'number' },
        description: 'Menu width(px).',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    height: {
        name: 'height',
        type: { name: 'number' },
        description: 'Menu height(px).',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
    ...getArgTypes('slots', slots),
    ...getArgTypes('events', events),
};
