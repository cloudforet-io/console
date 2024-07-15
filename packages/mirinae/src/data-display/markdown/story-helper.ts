export const getMarkdownArgTypes = () => ({
    markdown: {
        name: 'markdown',
        type: 'string',
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
        type: 'object',
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
        type: 'string',
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
        type: 'boolean',
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
