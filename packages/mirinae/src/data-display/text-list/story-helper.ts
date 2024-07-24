import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

export const getTextListArgs = (): Args => ({
    items: ['hi', 'hello'],
    delimiter: ', ',
    subKey: undefined,
    link: undefined,
    linkTarget: undefined,
    defaultSlot: null,
    delimiterSlot: null,
});

export const getTextLisyParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=2104%3A1508',
    },
});

export const getTextListArgTypes = (): ArgTypes => ({
    items: {
        name: 'items',
        type: { name: 'array' } as SBType,
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    default: { table: { disable: true } },
});
