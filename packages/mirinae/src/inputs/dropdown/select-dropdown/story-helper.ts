import type { ArgTypes } from '@storybook/addons';

import { getContextMenuArgTypes } from '@/inputs/context-menu/story-helper';
import {
    CONTEXT_MENU_POSITION,
    SELECT_DROPDOWN_APPEARANCE_TYPE,
    SELECT_DROPDOWN_STYLE_TYPE,
} from '@/inputs/dropdown/select-dropdown/type';


const extraArgTypes: ArgTypes = {
    /* props */
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: 'Style type to display selected items.',
        defaultValue: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `'${SELECT_DROPDOWN_STYLE_TYPE.DEFAULT}'`,
            },
        },
        control: {
            type: 'select',
            options: SELECT_DROPDOWN_STYLE_TYPE,
        },
    },
    appearanceType: {
        name: 'appearanceType',
        type: { name: 'string' },
        description: 'Appearance type to display selected items.',
        defaultValue: SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `'${SELECT_DROPDOWN_APPEARANCE_TYPE.BASIC}'`,
            },
        },
        control: {
            type: 'select',
            options: SELECT_DROPDOWN_APPEARANCE_TYPE,
        },
    },
    disabled: {
        name: 'disabled',
        type: { name: 'boolean' },
        description: 'Whether to disable selection or not.',
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
    placeholder: {
        name: 'placeholder',
        type: { name: 'string' },
        description: 'Search input placeholder.',
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
    selectionLabel: {
        name: 'selectionLabel',
        type: { name: 'string' },
        description: 'Label to display selected items.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'text',
        },
    },
    selectionHighlight: {
        name: 'selectionHighlight',
        type: { name: 'boolean' },
        description: 'Whether to highlight or not.',
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
    showAlertDot: {
        name: 'showAlertDot',
        type: { name: 'boolean' },
        description: 'Whether to show alert or not.',
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
    showDeleteAllButton: {
        name: 'showDeleteAllButton',
        type: { name: 'boolean' },
        description: 'Whether to show delete all button or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
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
    buttonIcon: {
        name: 'buttonIcon',
        type: { name: 'string' },
        description: 'Icons for dropdown right button. Useful when `type` props is `icon-button`.',
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
    isFixedWidth: {
        name: 'isFixedWidth',
        type: { name: 'boolean' },
        description: 'Whether to fix width.',
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
    isFilterable: {
        name: 'isFilterable',
        type: { name: 'boolean' },
        description: 'Whether to be filterable or not.',
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
    menuPosition: {
        name: 'menuPosition',
        type: { name: 'string' },
        description: 'Position of Context menu',
        defaultValue: CONTEXT_MENU_POSITION.LEFT,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: CONTEXT_MENU_POSITION.LEFT,
            },
        },
        control: {
            type: 'select',
            options: [...Object.values(CONTEXT_MENU_POSITION)],
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
        control: {
            type: null,
        },
    },
    disableHandler: {
        name: 'disableHandler',
        type: { name: 'boolean' },
        description: 'Whether to execute handler automatically or not.',
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
    pageSize: {
        name: 'pageSize',
        type: { name: 'number' },
        description: 'Page size to show items.',
        defaultValue: 10,
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
            options: { min: 0 },
        },
    },
    resetSelectedOnUnmounted: {
        name: 'resetSelectedOnUnmounted',
        type: { name: 'boolean' },
        description: 'Whether to reset selected items when unmounted or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    initSelectedWithHandler: {
        name: 'initSelectedWithHandler',
        type: { name: 'boolean' },
        description: 'Whether to initialize selected items with handler or not.',
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
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
    inputLeftArea: {
        name: 'input-left-area',
        description: 'This is a slot for the left area of the input.',
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
    };
    Object.keys(contextMenuArgTypes).forEach((k) => {
        const item = contextMenuArgTypes[k];
        if (item.table?.category === 'slots') {
            argTypes[`menu-${k}`] = { ...item, name: `menu-${contextMenuArgTypes[k]?.name}` };
        }
    });
    return argTypes;
};

export const getSelectDropdownArgTypes = (): ArgTypes => ({
    ...extraArgTypes,
    ...initContextMenuArgTypes(),
});
