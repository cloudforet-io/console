import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';

export const getDefinitionTableDefaultArgs = () => ({
    fields: [
        { label: 'Id', name: 'collector_id' },
        { label: 'Name', name: 'name' },
        { label: 'Provider', name: 'provider' },
    ],
    data: {
        collector_id: 'collector-6746d641c98b',
        name: 'collector name',
        provider: 'aws',
    },
    loading: false,
    skeletonRows: 5,
    disableCopy: false,
    styleType: DEFINITION_TABLE_STYLE_TYPE.primary,
    block: false,
    customKeyWidth: undefined,
});

export const getDefinitionTableArgTypes = () => ({
    fields: {
        name: 'fields',
        type: 'array',
        description: 'Fields of definition table.',
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
    data: {
        name: 'data',
        type: 'object, array',
        description: 'Data object of definition table.',
        table: {
            type: {
                summary: 'object, object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    loading: {
        name: 'loading',
        type: 'boolean',
        description: 'Loading.',
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
    skeletonRows: {
        name: 'skeletonRows',
        type: 'number',
        description: 'Rows of skeletons',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 5,
            },
        },
        control: 'number',
    },
    disableCopy: {
        name: 'disableCopy',
        type: 'boolean',
        description: 'Whether to GLOBALLY disable copy button or not.',
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
    styleType: {
        name: 'styleType',
        type: 'string',
        description: `Box style types. ${Object.values(DEFINITION_TABLE_STYLE_TYPE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${DEFINITION_TABLE_STYLE_TYPE.primary}"`,
            },
        },
        control: 'select',
        options: Object.values(DEFINITION_TABLE_STYLE_TYPE),
    },
    block: {
        name: 'block',
        type: 'boolean',
        description: 'Whether to GLOBALLY show value with full width or not.',
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
    customKeyWidth: {
        name: 'customKeyWidth',
        type: 'string',
        description: 'Custom Width of table key',
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
