import type { SBType } from '@storybook/types';
import type { ArgTypes, Args } from '@storybook/vue';

import { dynamicFieldTypes } from '@/data-display/dynamic/dynamic-field/type/field-schema';

export const getDynamicFieldArgs = (): Args => ({
    type: `${dynamicFieldTypes[0]}`,
    options: {},
    data: 'data',
    extraData: {},
    typeOptions: {},
    handler: (props) => props,
});

export const getDynamicFieldArgTypes = (): ArgTypes => ({
    type: {
        name: 'type',
        type: { name: 'string' },
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
        type: { name: 'object' } as SBType,
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
        type: { name: 'function' },
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
