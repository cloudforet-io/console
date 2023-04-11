import type { ArgTypes } from '@storybook/addons';

import { getQuerySearchTags } from '@/inputs/search/query-search-tags/mock';

export const getQuerySearchTagsArgTypes = (): ArgTypes => ({
    tags: {
        name: 'tags',
        type: { name: 'array' },
        description: 'Tags for query search. Follow the QuerySearch component spec. sync props.',
        defaultValue: getQuerySearchTags(),
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
    timezone: {
        name: 'timezone',
        type: { name: 'string' },
        description: 'Timezone that is used for display time value of query search tags.',
        defaultValue: 'UTC',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'UTC',
            },
        },
        control: {
            type: 'text',
        },
    },
    validator: {
        name: 'validator',
        type: { name: 'function' },
        description: 'Validator for each tag.',
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
    },
    converter: {
        name: 'converter',
        type: { name: 'function' },
        description: 'Converter for each tag.',
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
    },
    readOnly: {
        name: 'readOnly',
        type: { name: 'boolean' },
        description: 'Whether to make editable or not.',
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
});
