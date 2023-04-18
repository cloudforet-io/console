import type { ArgTypes } from '@storybook/addons';

import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const getDynamicFieldArgTypes = (): ArgTypes => ({
    type: {
        name: 'type',
        type: { name: 'string' },
        description: `The type of dynamic field. <br/>
                    Available types: ${dynamicFieldTypes}`,
        defaultValue: `${dynamicFieldTypes[0]}`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `'${dynamicFieldTypes[0]}'`,
            },
        },
        control: {
            type: 'select',
            options: dynamicFieldTypes,
        },
    },
    options: {
        name: 'options',
        type: { name: 'object' },
        description: 'The options for field. Different by each type.',
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
        control: {
            type: 'object',
        },
    },
    data: {
        name: 'data',
        type: { name: 'any' },
        description: 'Data to display.',
        defaultValue: 'data',
        table: {
            type: {
                summary: 'any',
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
    extraData: {
        name: 'extraData',
        type: { name: 'any' },
        description: `Extra data that is just passed to each field. <br/>
                    It's useful when you want to reformat the data with handler.`,
        defaultValue: {},
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    typeOptions: {
        name: 'typeOptions',
        type: { name: 'any' },
        description: 'Options that is the same with all fields even in recursive fields like enum type.',
        defaultValue: {},
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    handler: {
        name: 'handler',
        type: { name: 'function' },
        description: 'handler that reformat the data or options to display field.',
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
        control: {
            type: 'object',
        },
    },
});
