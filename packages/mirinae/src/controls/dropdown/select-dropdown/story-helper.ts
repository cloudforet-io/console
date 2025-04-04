import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getContextMenuArgTypes, getContextMenuArgs } from '@/controls/context-menu/story-helper';
import {
    CONTEXT_MENU_POSITION,
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/controls/dropdown/select-dropdown/type';


const extraArgs: Args = {
    styleType: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
    appearanceType: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: undefined,
    selectionLabel: undefined,
    selectionHighlight: false,
    showAlertDot: false,
    showDeleteAllButton: true,
    useFixedMenuStyle: false,
    buttonIcon: undefined,
    isFixedWidth: false,
    resetSelectionOnMenuClose: false,
    isFilterable: false,
    visibleMenu: false,
    menuPosition: CONTEXT_MENU_POSITION.LEFT,
    indexMode: false,
    menuWidth: undefined,
    boundary: undefined,
    disableHandler: false,
    pageSize: 10,
    resetSelectedOnUnmounted: true,
    initSelectedWithHandler: true,
    hideHeaderWithoutItems: false,
    block: false,
};

const extraArgTypes: ArgTypes = {
    /* props */
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Style type to display selected items.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `'${SELECT_DROPDOWN_STYLE_TYPE.DEFAULT}'`,
            },
        },
        control: 'select',
        options: SELECT_DROPDOWN_STYLE_TYPE,
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
                summary: `'${SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC}'`,
            },
        },
        control: 'select',
        options: SELECT_DROPDOWN_APPEARANCE_TYPE,
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: 'Size of dropdown button.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'md',
            },
        },
        control: 'select',
        options: ['md', 'sm'],
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
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Whether to apply invalid style or not.',
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
    placeholder: {
        name: 'placeholder',
        type: { name: 'string' },
        description: 'Search input placeholder.',
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
    selectionLabel: {
        name: 'selectionLabel',
        type: { name: 'string' },
        description: 'Label to display selected items.',
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
    selectionHighlight: {
        name: 'selectionHighlight',
        type: { name: 'boolean' },
        description: 'Whether to highlight or not.',
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
    showAlertDot: {
        name: 'showAlertDot',
        type: { name: 'boolean' },
        description: 'Whether to show alert or not.',
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
    showDeleteAllButton: {
        name: 'showDeleteAllButton',
        type: { name: 'boolean' },
        description: 'Whether to show delete all button or not.',
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
    buttonIcon: {
        name: 'buttonIcon',
        type: { name: 'string' },
        description: 'Icons for dropdown right button. Useful when `type` props is `icon-button`.',
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
    isFixedWidth: {
        name: 'isFixedWidth',
        type: { name: 'boolean' },
        description: 'Whether to fix width.',
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
    resetSelectionOnMenuClose: {
        name: 'resetSelectionOnMenuClose',
        type: { name: 'boolean' },
        description: 'reset selection when menu close.',
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
    isFilterable: {
        name: 'isFilterable',
        type: { name: 'boolean' },
        description: 'Whether to be filterable or not.',
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
    menuPosition: {
        name: 'menuPosition',
        type: { name: 'string' },
        description: 'Position of Context menu',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: CONTEXT_MENU_POSITION.LEFT,
            },
        },
        control: 'select',
        options: [...Object.values(CONTEXT_MENU_POSITION)],
    },
    indexMode: {
        name: 'indexMode',
        type: { name: 'boolean' },
        description: 'Whether to `selected` props works with item\'s index or not.',
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
    menuWidth: {
        name: 'menuWidth',
        type: { name: 'string' },
        description: 'The width of the menu. It can be css value or \'target-width\' which is same as dropdown button width. Default is \'auto\'.',
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
    boundary: {
        name: 'boundary',
        type: { name: 'string' },
        description: 'When the menu is opened, the menu is displayed within the boundary element. The boundary element is a CSS selector.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'select',
    },
    handler: {
        name: 'handler',
        type: { name: 'function' },
        description: 'Handler that returns auto-completion menu according to input value. If no value is given, the default handler is executed.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function, array of function',
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
        description: 'Whether to execute handler automatically or not.',
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
    resetSelectedOnUnmounted: {
        name: 'resetSelectedOnUnmounted',
        type: { name: 'boolean' },
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
    initSelectedWithHandler: {
        name: 'initSelectedWithHandler',
        type: { name: 'boolean' },
        description: 'Whether to initialize selected items with handler or not.',
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
    hideHeaderWithoutItems: {
        name: 'hideHeaderWithoutItems',
        type: { name: 'boolean' },
        description: 'Whether to hide the header when there are no items that indicate the name of the header.',
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
        description: 'Whether to show value with full width or not.',
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

    /* events */
    onHideMenu: {
        name: 'hide-menu',
        description: 'Emitted when the menu starts to hide.',
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
    onShowMenu: {
        name: 'show-menu',
        description: 'Emitted when the menu starts to show.',
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
    onFocusMenu: {
        name: 'focus-menu',
        description: 'Emitted when menu is focused.',
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
    onSelectMenu: {
        name: 'select-menu',
        description: 'Emitted when menu item is selected.',
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
    /* slots */
    dropdownIcon: {
        name: 'dropdown-icon',
        description: 'This is a slot for custom dropdown icon.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    dropdownButton: {
        name: 'dropdown-button',
        description: 'This is a slot for custom dropdown button.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    'selected-radio-label': {
        name: 'selected-radio-label',
        description: 'This is a slot that allows you to customize the label of the selected value when the selected value is a radio button type.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    selectedExtraSlot: {
        name: 'selected-extra',
        description: 'This is a slot for right space of selected items.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    contextMenuHeader: {
        name: 'context-menu-header',
        description: 'This is a slot for the header of the PContextMenu.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    dropdownLeftArea: {
        name: 'dropdown-left-area',
        description: 'This is a slot for the left area of the dropdown button.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    dropdownIconButton: {
        name: 'dropdown-icon-button',
        description: 'This is a slot for custom icon button in the dropdown button.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    noDataArea: {
        name: 'no-data-area',
        description: 'This is a slot for the left area of the dropdown button.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
    /* events */
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
    onUpdateSearchText: {
        name: 'update:search-text',
        description: 'Event emitted when search text is updated.',
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
        description: 'Event emitted when selected is updated.',
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
    onSelect: {
        name: 'select',
        description: 'Event emitted when an item is selected.',
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
    onDeleteTag: {
        name: 'delete-tag',
        description: 'Event emitted when a tag is deleted. It works only when the multiSelectable is true and appearanceType is \'stack\'',
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
    onClickShowMore: {
        name: 'click-show-more',
        description: 'Event emitted when \'show more\' item is clicked.',
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
    onClearSelection: {
        name: 'clear-selection',
        description: 'Event emitted when \'clear selection\' item is clicked.',
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
    onClickDone: {
        name: 'click-done',
        description: 'Event emitted when \'done\' item is clicked.',
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

const initContextMenuArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();
    const argTypes: ArgTypes = {
        menu: contextMenuArgTypes.menu,
        loading: contextMenuArgTypes.loading,
        selected: contextMenuArgTypes.selected,
        multiSelectable: contextMenuArgTypes.multiSelectable,
        searchText: contextMenuArgTypes.searchText,
        readonly: contextMenuArgTypes.readonly,
        showSelectHeader: contextMenuArgTypes.showSelectHeader,
        showSelectMarker: contextMenuArgTypes.showSelectMarker,
        showClearSelection: contextMenuArgTypes.showClearSelection,
    };
    Object.keys(contextMenuArgTypes).forEach((k) => {
        const item = contextMenuArgTypes[k];
        if (item.table?.category === 'slots') {
            argTypes[`menu-${k}`] = { ...item, name: `menu-${contextMenuArgTypes[k]?.name}` };
        }
    });
    return argTypes;
};

const initSelectDropdownArgs = (): Args => {
    const contextMenuArgs = getContextMenuArgs();
    const contextMenuArgTypes = getContextMenuArgTypes();

    const args: Args = {
        menu: contextMenuArgs.menu,
        loading: contextMenuArgs.loading,
        selected: contextMenuArgs.selected,
        multiSelectable: contextMenuArgs.multiSelectable,
        searchText: contextMenuArgs.searchText,
        readonly: contextMenuArgs.readonly,
        showSelectHeader: contextMenuArgs.showSelectHeader,
        showSelectMarker: contextMenuArgs.showSelectMarker,
        showClearSelection: contextMenuArgTypes.showClearSelection,
    };

    Object.keys(contextMenuArgs).forEach((k) => {
        const item = contextMenuArgTypes[k];
        if (item.table?.category === 'slots') {
            args[`menu-${k}`] = null;
        }
    });

    return args;
};

export const getSelectDropdownArgs = (): Args => ({
    ...extraArgs,
    ...initSelectDropdownArgs(),
});

export const getSelectDropdownArgTypes = (): ArgTypes => ({
    ...extraArgTypes,
    ...initContextMenuArgTypes(),
    'update:visible-menu': { table: { disable: true } },
    'update:search-text': { table: { disable: true } },
    'update:selected': { table: { disable: true } },
    select: { table: { disable: true } },
    'delete-tag': { table: { disable: true } },
    'click-show-more': { table: { disable: true } },
    'clear-selection': { table: { disable: true } },
    'click-done': { table: { disable: true } },
    'click-button': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`dropdown-${slot}`': { table: { disable: true } },
    'dropdown-left-area': { table: { disable: true } },
    'context-menu-header': { table: { disable: true } },
    'no-data-area': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`menu-${slot}`': { table: { disable: true } },
});

export const getSelectDropdownParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});
