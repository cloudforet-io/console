import type { SBType } from '@storybook/types';
import type { ArgTypes, Args, Parameters } from '@storybook/vue';

import mock from '@/data-display/markdown/mock';

export const getMarkdownArgs = (): Args => ({
    markdown: mock.markdown,
    data: mock.data,
    language: 'en',
    removeSpacing: false,
});

export const getMarkdownParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5718%3A9288',
    },
});

export const getMarkdownArgTypes = (): ArgTypes => ({
    markdown: {
        name: 'markdown',
        type: { name: 'string' },
        description: 'Markdown data',
        table: {
            type: {
                summary: '`string` or `object`',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'object',
    },
    data: {
        name: 'data',
        type: { name: 'object' } as SBType,
        description: 'Variable data to be rendered combined with markdown. Use the ejs.render function internally.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
        control: 'object',
    },
    language: {
        name: 'language',
        type: { name: 'string' },
        description: 'Language for display markdown',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'en',
            },
        },
        control: 'select',
        options: ['en', 'ko'],
    },
    removeSpacing: {
        name: 'removeSpacing',
        type: { name: 'boolean' },
        description: 'Whether to remove spacing(margins or paddings) or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
});
