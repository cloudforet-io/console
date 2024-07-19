import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import { getQuerySearchTags } from '@/inputs/search/query-search-tags/mock';

export const getQuerySearchTagsArgs = (): Args => ({
    tags: getQuerySearchTags(),
    timezone: 'UTC',
    validator: undefined,
    converter: undefined,
    readOnly: false,
});

export const getQuerySearchTagsParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=73%3A0',
    },
});

export const getQuerySearchTagsArgTypes = (): ArgTypes => ({
    tags: {
        name: 'tags',
        type: { name: 'array' } as SBType,
        description: 'Tags for query search. Follow the QuerySearch component spec. sync props.',
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
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone that is used for display time value of query search tags.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: 'text',
    },
    validator: {
        name: 'validator',
        type: { name: 'function' },
        description: 'Validator for each tag.',
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
    converter: {
        name: 'converter',
        type: { name: 'function' },
        description: 'Converter for each tag.',
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
    readOnly: {
        name: 'readOnly',
        type: { name: 'boolean' },
        description: 'Whether to make editable or not.',
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
    // default
    // eslint-disable-next-line no-template-curly-in-string
    "`data-type-${tag.key.dataType || 'string'}`": { table: { disable: true } },
});
