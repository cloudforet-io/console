import type { ArgTypes } from '@storybook/addons';

import { getKeyItemSets, getValueHandlerMap } from '@/inputs/dropdown/query-search-dropdown/mock';
import { getSearchArgTypes } from '@/inputs/search/search/story-helper';

export const getQuerySearchDropdownArgTypes = (): ArgTypes => {
    const searchArgTypes = getSearchArgTypes();
    const keyItemSets = getKeyItemSets(5, 1);
    return {
        value: searchArgTypes.value,
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
        'v-model': searchArgTypes['v-model'],
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
    };
};
