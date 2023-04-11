import type { ArgTypes } from '@storybook/addons';

import { getSearchArgTypes } from '@/inputs/search/search/story-helper';

export const getQuerySearchArgTypes = (): ArgTypes => {
    const searchArgTypes = getSearchArgTypes();
    return {
        value: searchArgTypes.value,
        placeholder: searchArgTypes.placeholder,
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
        },
        valueHandlerMap: {
            name: 'valueHandlerMap',
            type: { name: 'object' },
            description: 'Query value handlers.',
            defaultValue: {},
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
    };
};
