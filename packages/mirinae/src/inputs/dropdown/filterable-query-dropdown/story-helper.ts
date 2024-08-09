import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/filterable-query-dropdown/mock';

export const getFilterableQueryDropdownArgs = (): Args => {
    const keyItemSets = getKeyItemSets(5, 1);

    return {
        placeholder: '',
        focused: false,
        keyItemSets,
        valueHandlerMap: getValueHandlerMap(keyItemSets),
        selected: [],
        multiSelectable: false,
        useFixedMenuStyle: false,
        visibleMenu: undefined,
    };
};

export const getFilterableQueryDropdownParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'figma url',
    },
});

export const getFilterableQueryDropdownArgTypes = (): ArgTypes => ({
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
                summary: '',
            },
        },
    },
    focused: {
        name: 'focused',
        type: { name: 'boolean' },
        description: 'Whether to make focused at the first time or not.',
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
    keyItemSets: {
        name: 'keyItemSets',
        type: { name: 'array' } as SBType,
        description: 'Query key list.',
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
        type: { name: 'object' } as SBType,
        description: 'Query value handlers.',
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
        type: { name: 'array' } as SBType,
        description: 'Array of selected menu item. `sync` props.',
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
        type: { name: 'boolean' },
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
    // context menu fixed style props
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
    visibleMenu: {
        name: 'visibleMenu',
        type: { name: 'boolean' },
        description: 'Whether to show the menu or not. Automatically determined if no value is given. `sync` props.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: null,
    },
});
