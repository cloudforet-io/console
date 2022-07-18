import type { ArgTypes } from '@storybook/addons';

export const getFileUploaderArgTypes = (): ArgTypes => ({
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
    serverEndpoint: {
        name: 'serverEndpoint',
        type: { name: 'string' },
        description: 'Server Endpoint for uploading files',
        defaultValue: '',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
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
});
