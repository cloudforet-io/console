import type { ArgTypes } from '@storybook/addons';

import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';

export const getDefinitionTableArgTypes = (): ArgTypes => ({
    fields: {
        name: 'fields',
        type: { name: 'array' },
        description: 'Fields of definition table.',
        defaultValue: [
            { label: 'Id', name: 'collector_id' },
            { label: 'Name', name: 'name' },
            { label: 'Provider', name: 'provider' },
        ],
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
    data: {
        name: 'data',
        type: { name: 'object, array' },
        description: 'Data object of definition table.',
        defaultValue: {
            collector_id: 'collector-6746d641c98b',
            name: 'collector name',
            provider: 'aws',
        },
        table: {
            type: {
                summary: 'object, object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'object',
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Loading.',
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
    skeletonRows: {
        name: 'skeletonRows',
        type: { name: 'number' },
        description: 'Rows of skeletons',
        defaultValue: 5,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 5,
            },
        },
        control: {
            type: 'number',
        },
    },
    disableCopy: {
        name: 'disableCopy',
        type: { name: 'boolean' },
        description: 'Whether to GLOBALLY disable copy button or not.',
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
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Box style types. ${Object.values(DEFINITION_TABLE_STYLE_TYPE)} are available.`,
        defaultValue: DEFINITION_TABLE_STYLE_TYPE.primary,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${DEFINITION_TABLE_STYLE_TYPE.primary}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(DEFINITION_TABLE_STYLE_TYPE),
        },
    },
    block: {
        name: 'block',
        type: { name: 'boolean' },
        description: 'Whether to GLOBALLY show value with full width or not.',
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
    },
    customWidth: {
        name: 'customWidth',
        type: { name: 'string' },
        description: 'Custom Width of table key',
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
    },
});
