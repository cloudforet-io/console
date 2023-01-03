import type { ArgTypes } from '@storybook/addons';

import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/filterable-query-dropdown/mock';

export const getFilterableQueryDropdownArgTypes = (): ArgTypes => {
    const keyItemSets = getKeyItemSets(5, 1);
    return {
        placeholder: {
            name: 'placeholder',
            type: { name: 'string' },
            description: 'Input placeholder.',
            defaultValue: '',
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: '',
                },
            },
        },
        focused: {
            name: 'focused',
            type: { name: 'boolean' },
            description: 'Whether to make focused at the first time or not.',
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
        keyItemSets: {
            name: 'keyItemSets',
            type: { name: 'array' },
            description: 'Query key list.',
            defaultValue: keyItemSets,
            table: {
                type: {
                    summary: 'array',
                },
                category: 'props',
                defaultValue: {
                    summary: '[]',
                },
            },
        },
        valueHandlerMap: {
            name: 'valueHandlerMap',
            type: { name: 'object' },
            description: 'Query value handlers.',
            defaultValue: getValueHandlerMap(keyItemSets),
            table: {
                type: {
                    summary: 'object',
                },
                category: 'props',
                defaultValue: {
                    summary: '{}',
                },
            },
        },
        selected: {
            name: 'selected',
            type: { name: 'array' },
            description: 'Array of selected menu item. `sync` props.',
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
    };
};
