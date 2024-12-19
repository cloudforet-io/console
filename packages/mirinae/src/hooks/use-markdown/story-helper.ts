import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import type { UseMarkdownOptions } from './use-markdown';

export const getUseMarkdownArgs = (): Args => ({
    value: '',
    // object: undefined,
    // boolean: false,
    // select: '',
    // defaultSlot: null,
    // onClick: null
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
});
