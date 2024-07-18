import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getSearchArgTypes, getSearchArgs } from '@/inputs/search/search/story-helper';

export const getQuerySearchParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5952%3A20040',
    },
});

export const getQuerySearchArgs = (): Args => {
    const searchArgs = getSearchArgs();

    return {
        value: searchArgs.value,
        placeholder: searchArgs.placeholder,
        'v-model': searchArgs['v-model'],
        focused: false,
        keyItemSets: [],
        valueHandlerMap: {},
    };
};

export const getQuerySearchArgTypes = (): ArgTypes => {
    const searchArgTypes = getSearchArgTypes();
    return {
        value: searchArgTypes.value,
        placeholder: searchArgTypes.placeholder,
        'v-model': searchArgTypes['v-model'],
        focused: {
            name: 'focused',
            type: 'boolean',
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
    };
};
