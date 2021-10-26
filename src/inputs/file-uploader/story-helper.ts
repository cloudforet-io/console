import { ArgTypes } from '@storybook/addons';

export const argTypes: ArgTypes = {
    /* props */
    uploadedFiles: {
        name: 'uploadedFiles',
        type: { name: 'array' },
        description: 'Array of uploaded files',
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
    'v-model': {
        name: 'v-model',
        type: { name: 'any' },
        description: 'Two way binding for `uploadedFiles` props with `update:uploadedFiles` event.',
        defaultValue: [],
        table: {
            type: {
                summary: 'any',
            },
            category: 'model',
            defaultValue: {
                summary: '[]',
            },
        },
        control: null,
    },
    value: {
        name: 'value',
        type: { name: 'any' },
        description: 'The value to be compared for the \'uploadedFiles\' props.',
        defaultValue: true,
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: 'true',
            },
        },
        control: {
            type: 'object',
        },
    },
};
