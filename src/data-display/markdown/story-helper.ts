import type { ArgTypes } from '@storybook/addons';

import mock from '@/data-display/markdown/mock';

export const getMarkdownArgTypes = (): ArgTypes => ({
    markdown: {
        name: 'markdown',
        type: { name: 'string' },
        description: 'Markdown data',
        defaultValue: mock.markdown,
        table: {
            type: {
                summary: '`string` or `object`',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'object',
        },
    },
    data: {
        name: 'data',
        type: { name: 'object' },
        description: 'Variable data to be rendered combined with markdown. Use the ejs.render function internally.',
        defaultValue: mock.data,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: {
            type: 'object',
        },
    },
    language: {
        name: 'language',
        type: { name: 'string' },
        description: 'Language for display markdown',
        defaultValue: 'en',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'en',
            },
        },
        control: {
            type: 'select',
            options: ['en', 'ko'],
        },
    },
    removeSpacing: {
        name: 'removeSpacing',
        type: { name: 'boolean' },
        description: 'Whether to remove spacing(margins or paddings) or not.',
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
        control: {
            type: 'boolean',
        },
    },
});
