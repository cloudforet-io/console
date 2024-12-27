import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import type { UseMarkdownOptions } from './use-markdown';

export const getUseMarkdownArgs = (): Args => ({
    value: '',
    inlineCodeClass: '',
    codeBlockHighlighting: false,
});

export const getUseMarkdownParameters = (): Parameters => ({});

export const getUseMarkdownArgTypes = (): ArgTypes<UseMarkdownOptions> => ({
    value: {
        name: 'value',
        type: { name: 'string' },
        description: 'Markdown content to display. string or Ref<string>',
        table: {
            type: {
                summary: 'string',
            },
            category: 'options',
            defaultValue: {
                summary: '""',
            },
        },
        control: 'text',
    },
    inlineCodeClass: {
        name: 'inlineCodeClass',
        type: { name: 'string' },
        description: 'Class name for inline code',
        table: {
            type: { summary: 'string' },
            category: 'options',
            defaultValue: { summary: '""' },
        },
        control: 'text',
    },
    codeBlockHighlighting: {
        name: 'codeBlockHighlighting',
        type: { name: 'boolean' },
        description: 'Whether to apply code block highlighting',
        table: {
            type: { summary: 'boolean' },
            category: 'options',
            defaultValue: { summary: 'false' },
        },
        control: 'boolean',
    },
});
