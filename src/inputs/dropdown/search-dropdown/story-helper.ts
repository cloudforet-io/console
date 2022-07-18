import type { ArgTypes } from '@storybook/addons';

import { getContextMenuArgTypes } from '@/inputs/context-menu/story-helper';
import { SEARCH_DROPDOWN_TYPE } from '@/inputs/dropdown/search-dropdown/type';
import { getSearchArgTypes } from '@/inputs/search/search/story-helper';


const extraArgTypes: ArgTypes = {
    /* props */
    type: {
        name: 'type',
        type: { name: 'string' },
        description: 'Type of PSearchDropdown. There are 3 types: `default` and `radioButton`.',
        defaultValue: SEARCH_DROPDOWN_TYPE.default,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'default',
            },
        },
        control: {
            type: 'select',
            options: Object.values(SEARCH_DROPDOWN_TYPE),
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
    disableDeleteAll: {
        name: 'disableDeleteAll',
        type: { name: 'boolean' },
        description: 'If it is `true`, disable delete all and hide delete all button.',
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
    // context menu fixed style props
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
    visibleMenu: {
        name: 'visibleMenu',
        type: { name: 'boolean' },
        description: 'Whether to show the menu or not. Automatically determined if no value is given. `sync` props.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'boolean',
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
    'selected-radio-label': {
        name: 'selected-radio-label',
        description: 'This is a slot that allows you to customize the label of the selected value when the selected value is a radio button type.',
        defaultValue: { summary: null },
        table: {
            category: 'slots',
            type: { summary: null },
        },
    },
};

const initSearchArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {};
    const searchArgTypes = getSearchArgTypes();
    Object.keys(searchArgTypes).forEach((k) => {
        const item = searchArgTypes[k];
        if (item.table?.category === 'slots') {
            argTypes[`search-${k}`] = { ...item, name: `search-${k}` };
        } else {
            argTypes[k] = item;
        }
        if (['isFocused', 'value'].includes(k)) {
            item.control = { type: null };
        }
    });
    return argTypes;
};

const initContextMenuArgTypes = (): ArgTypes => {
    const contextMenuArgTypes = getContextMenuArgTypes();
    const argTypes: ArgTypes = {
        menu: contextMenuArgTypes.menu,
        loading: contextMenuArgTypes.loading,
        selected: contextMenuArgTypes.selected,
        multiSelectable: contextMenuArgTypes.multiSelectable,
        strictSelectMode: contextMenuArgTypes.strictSelectMode,
        disableDeleteAll: contextMenuArgTypes.disableDeleteAll,
    };
    Object.keys(contextMenuArgTypes).forEach((k) => {
        const item = contextMenuArgTypes[k];
        if (item.table?.category === 'slots') {
            argTypes[`menu-${k}`] = { ...item, name: `menu-${contextMenuArgTypes[k]?.name}` };
        }
    });
    return argTypes;
};

export const getSearchDropdownArgTypes = (): ArgTypes => ({
    ...extraArgTypes,
    ...initSearchArgTypes(),
    ...initContextMenuArgTypes(),
});
