import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getContextMenuItemArgs, getContextMenuItemArgTypes } from '@/inputs/context-menu/context-menu-item/story-helper';
// eslint-disable-next-line import/no-cycle
import { getSearchSlotArgTypes } from '@/inputs/search/search/story-helper';

const searchSlots = Object.values(getSearchSlotArgTypes());


export const contextMenuSlots: [string, string][] = [
    ['header', 'A slot that replaces the header area of the context menu.'],
    ['menu', 'A slot that replaces the whole context menu. It\'s useful when you want to use context menu\'s container style, no data & loading container only.'],
    ['items', 'A slot that replaces the area for menu items. This is useful when you want to directly combine and use context menu items in a compound component way.'],
    ['bottom', 'A slot that replaces the bottom area of the context menu.'],
    ['no-data-format', 'A slot that replaces the inner area of the no-data container. It replaces style of the entire corresponding slot area.'],
    ['item--format', 'A slot used when customizing each menu item whose type is \'item\' type with default style applied. This leads directly to the default slot of ContextMenuItem.'],
    // eslint-disable-next-line max-len
    ['item-text-list', 'A slot used when customizing each menu item whose type is \'item\' type with default style applied. This leads directly to the text-list slot of ContextMenuItem. This works only when the highlightTerm is given.'],
    ['header-{item.name}', 'A slot that replaces the inner area of a menu item whose type is \'header\' with a specific name.'],
    ...searchSlots.map<[string, string]>((slot) => [`search-${slot.name}`, `A slot for search component's ${slot.name} slot: ${slot.description} (This is enabled in searchable case only)`]),

];

const contextMenuEvents: [string, string][] = [
    ['<item.name>:select', 'This event is emitted when a specific item is selected. As arguments, index and click event are passed. This event will be deprecated, so don\'t use it.'],
    ['select', 'This event is emitted when a specific item is selected. As arguments, item name and index are passed'],
    ['focus', 'This event is emitted when item is focused. As arguments, index of item is passed'],
    ['blur', 'This event is emitted when item is blurred.'],
    ['keyup:up:end', 'This event is emitted when a menu item is tracked through the arrow up key, and the down key is pressed at the first menu item.'],
    ['keyup:down:end', 'This event is emitted when a menu item is tracked through the arrow down key, and the down key is pressed at the last menu item.'],
    ['keyup:esc', 'This event is emitted when a esc key is pressed.'],
    ['click-button', 'This event is emitted when the button(in the item whose type is button) is clicked. As arguments, item, index and click event will be passed.'],
    ['click-done', 'This event is emitted when the done-button(in multi-selectable & show-select-header case) is clicked.'],
    ['click-show-more', 'This event is emitted when the show-more-button is clicked.'],
    ['clear-selection', 'This event is emitted when the clear-selection is clicked.'],
    ['update:search-text', 'This event is emitted when the input value of search component(in searchable case) is updated. It allows two way binding of searchText prop.'],
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

export const getContextMenuArgs = (): Args => {
    const contextMenuItemArgs = getContextMenuItemArgs();

    return {
        title: undefined,
        menu: [],
        loading: false,
        selected: [{ name: 'collect' }],
        multiSelectable: false,
        showSelectMarker: false,
        itemHeightFixed: false,
        highlightTerm: contextMenuItemArgs.highlightTerm,
        noSelectIndication: false,
        showSelectHeader: false,
        showClearSelection: false,
        searchable: false,
        searchText: '',
        readonly: false,
        resetSelectedOnUnmounted: true,
        beforeSelect: undefined,
        beforeClearSelection: undefined,
        header: null,
        // 'menu': null,
        items: null,
        bottom: null,
        'no-data-format': null,
        'item-text-list': null,
        'search-left': null,
        'search-default': null,
        'search-right': null,
        '<item.name>:select': null,
        select: null,
        focus: null,
        blur: null,
        'keyup:up:end': null,
        'keyup:down:end': null,
        'keyup:esc': null,
        'click-button': null,
        'click-done': null,
        'click-show-more': null,
        'clear-selection': null,
        'update:search-text': null,
    };
};

export const getContextMenuParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A133521',
    },
});

export const getContextMenuArgTypes = (): ArgTypes => {
    const contextMenuItemArgTypes = getContextMenuItemArgTypes();
    return {
        title: {
            name: 'title',
            type: 'string',
            description: 'Context menu title',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: undefined,
                },
            },
            control: 'text',
        },
        menu: {
            name: 'menu',
            type: { name: 'array' } as SBType,
            description: 'Menu items',
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
        loading: {
            name: 'loading',
            type: 'boolean',
            description: 'Loading state.',
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
            description: 'Array of selected menu item.',
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
        multiSelectable: {
            name: 'multiSelectable',
            type: 'boolean',
            description: 'Whether to select multiple items or not.',
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
        showSelectMarker: {
            name: 'showSelectMarker',
            type: 'boolean',
            description: 'Whether to show checkbox or radio icon or not.',
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
        itemHeightFixed: {
            name: 'itemHeightFixed',
            type: 'boolean',
            description: 'Determines whether to make all items\' height fixed or not. If it\'s `true`, item text overflow will be ellipsis.',
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
        highlightTerm: contextMenuItemArgTypes.highlightTerm,
        noSelectIndication: {
            name: 'noSelectIndication',
            type: 'boolean',
            description: 'Whether to display selected state to selected item or not.',
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
        showSelectHeader: {
            name: 'showSelectHeader',
            type: 'boolean',
            description: 'Whether to activate the selection header that is activated when the value of multiSelectable is true.',
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
        showClearSelection: {
            name: 'showClearSelection',
            type: 'boolean',
            description: 'Whether to enable a button to deselect all selected items. It is activated when the value of multiSelectable is true.',
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
        searchable: {
            name: 'searchable',
            type: 'boolean',
            description: 'Whether to enable search or not.',
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
        searchText: {
            name: 'searchText',
            type: 'string',
            description: 'Input value for search component in searchable case. sync for two way binding is supported.',
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
        readonly: {
            name: 'readonly',
            type: 'boolean',
            description: 'Whether to make readonly or not.',
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
        resetSelectedOnUnmounted: {
            name: 'resetSelectedOnUnmounted',
            type: 'boolean',
            description: 'Whether to reset selected items when unmounted or not.',
            table: {
                type: {
                    summary: 'boolean',
                },
                category: 'props',
                defaultValue: {
                    summary: true,
                },
            },
            control: 'boolean',
        },
        beforeSelect: {
            name: 'beforeSelect',
            type: 'function',
            description: 'A function that is called before selecting an item. If it returns false, the selection is canceled.',
            table: {
                // disable: true,
                type: {
                    summary: 'function',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
        },
        beforeClearSelection: {
            name: 'beforeClearSelection',
            type: 'function',
            description: 'A function that is called before clearing all selected items. If it returns false, the clearing is canceled.',
            table: {
                type: {
                    summary: 'function',
                },
                category: 'props',
                defaultValue: {
                    summary: 'undefined',
                },
            },
        },
        ...getArgTypes('slots', contextMenuSlots),
        ...getArgTypes('events', contextMenuEvents),

        // default
        'search-left': { table: { disable: true } },
        'search-default': { table: { disable: true } },
        'search-right': { table: { disable: true } },
        '<item.name>:select': { table: { disable: true } },
        header: { table: { disable: true } },
        items: { table: { disable: true } },
        bottom: { table: { disable: true } },
        'no-data-format': { table: { disable: true } },
        'item-text-list': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`search-${slot}`': { table: { disable: true } },
        select: { table: { disable: true } },
        focus: { table: { disable: true } },
        blur: { table: { disable: true } },
        'keyup:up:end': { table: { disable: true } },
        'keyup:down:end': { table: { disable: true } },
        'keyup:esc': { table: { disable: true } },
        'click-button': { table: { disable: true } },
        'click-done': { table: { disable: true } },
        'click-show-more': { table: { disable: true } },
        'click-selection': { table: { disable: true } },
        'clear-selection': { table: { disable: true } },
        'update:search-text': { table: { disable: true } },
        'update:selected': { table: { disable: true } },
        'item--format': { table: { disable: true } },
        /* eslint-disable no-template-curly-in-string */
        '`header-${item.name}`': { table: { disable: true } },
    };
};
