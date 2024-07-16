export const getTextListDeafultArgs = () => ({
    items: ['hi', 'hello'],
    delimiter: ', ',
    subKey: undefined,
    link: undefined,
    linkTarget: undefined,
    defaultSlot: undefined,
    delimiterSlot: undefined,
});

export const getTextListArgTypes = () => ({
    items: {
        name: 'items',
        type: 'array',
        description: 'Array of string or object to display as text.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '"[]"',
            },
        },
        control: 'object',
    },
    delimiter: {
        name: 'delimiter',
        type: 'string',
        description: 'Delimiter to place between text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '", "',
            },
        },
        control: 'text',
    },
    subKey: {
        name: 'subKey',
        type: 'string',
        description: 'Subkey to get object value.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: 'text',
    },
    link: {
        name: 'link',
        type: 'string',
        description: 'Link address to link to text.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: 'text',
    },
    linkTarget: {
        name: 'linkTarget',
        type: 'string',
        description: 'Anchor\'s target when there is a link.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: 'text',
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    delimiterSlot: {
        name: 'delimiter',
        description: 'Slot for delimiter.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
});
