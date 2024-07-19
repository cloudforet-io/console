import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { DEFINITION_TABLE_STYLE_TYPE } from '@/data-display/tables/definition-table/config';

export const getDefinitionTableArgs = (): Args => ({
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

export const getDefinitionTableParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5373%3A6989',
    },
});

export const getDefinitionTableArgTypes = (): ArgTypes => ({
    fields: {
        name: 'fields',
        type: { name: 'array' } as SBType,
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
        type: { name: 'object' } as SBType,
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
        type: { name: 'boolean' },
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
        type: { name: 'number' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
    // default
    /* eslint-disable no-template-curly-in-string */
    '`data-${item.name}`': { table: { disable: true } },
    /* eslint-disable no-template-curly-in-string */
    '`data-${idx}`': { table: { disable: true } },
    key: { table: { disable: true } },
    extra: { table: { disable: true } },
    'no-data': { table: { disable: true } },
});
