import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

export const getFileUploaderArgs = (): Args => ({
    uploadedFiles: [],
    serverEndpoint: '',
    'v-model': [],
});

export const getFileUploaderParameters = (): Parameters => ({
    design: {
        type: { name: 'figma' },
        url: 'https://www.figma.com/',
    },
});

export const getFileUploaderArgTypes = (): ArgTypes => ({
    /* props */
    uploadedFiles: {
        name: 'uploadedFiles',
        type: { name: 'array' } as SBType,
        description: 'Array of uploaded files',
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
        description: 'Two way binding for `uploadedFiles` props with `update:uploadedFiles` event.',
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
