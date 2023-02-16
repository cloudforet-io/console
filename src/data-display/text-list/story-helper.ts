import type { ArgTypes } from '@storybook/addons';

export const getTextListArgTypes = (): ArgTypes => ({
    items: {
        name: 'items',
        type: { name: 'array' },
        description: 'Array of string or object to display as text.',
        defaultValue: ['hi', 'hello'],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '"[]"',
            },
        },
        control: {
            type: 'object',
        },
    },
    delimiter: {
        name: 'delimiter',
        type: { name: 'string' },
        description: 'Delimiter to place between text.',
        defaultValue: ', ',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '", "',
            },
        },
        control: {
            type: 'text',
        },
    },
    subKey: {
        name: 'subKey',
        type: { name: 'string' },
        description: 'Subkey to get object value.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: {
            type: 'text',
        },
    },
    link: {
        name: 'link',
        type: { name: 'string' },
        description: 'Link address to link to text.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: {
            type: 'text',
        },
    },
    linkTarget: {
        name: 'linkTarget',
        type: { name: 'string' },
        description: 'Anchor\'s target when there is a link.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '"undefined"',
            },
        },
        control: {
            type: 'text',
        },
    },
    // slots
    defaultSlot: {
        name: 'default',
        description: '',
        defaultValue: null,
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
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});
