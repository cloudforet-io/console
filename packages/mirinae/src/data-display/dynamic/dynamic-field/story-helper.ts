import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const getDynamicFieldArgTypes = () => ({
    type: {
        name: 'type',
        type: 'string',
        description: `The type of dynamic field. <br/>
                    Available types: ${dynamicFieldTypes}`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `'${dynamicFieldTypes[0]}'`,
            },
        },
        control: 'select',
        options: dynamicFieldTypes,
    },
    options: {
        name: 'options',
        type: 'object',
        description: 'The options for field. Different by each type.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    data: {
        name: 'data',
        type: 'any',
        description: 'Data to display.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    extraData: {
        name: 'extraData',
        type: 'any',
        description: `Extra data that is just passed to each field. <br/>
                    It's useful when you want to reformat the data with handler.`,
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    typeOptions: {
        name: 'typeOptions',
        type: 'any',
        description: 'Options that is the same with all fields even in recursive fields like enum type.',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    handler: {
        name: 'handler',
        type: 'function',
        description: 'handler that reformat the data or options to display field.',
        table: {
            type: {
                summary: 'function',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
});
