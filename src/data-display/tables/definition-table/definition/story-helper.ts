import { ArgTypes } from '@storybook/addons';

export const getDefinitionArgTypes = (): ArgTypes => ({
    name: {
        name: 'name',
        type: { name: 'string' },
        description: 'Name of key.',
        defaultValue: 'name',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Label of key.',
        defaultValue: 'label',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    data: {
        name: 'data',
        type: { name: 'any' },
        description: 'Data for value.',
        defaultValue: 'data',
        table: {
            type: {
                summary: 'any',
            },
            category: 'props',
            defaultValue: {
                summary: '""',
            },
        },
        control: {
            type: 'text',
        },
    },
    disableCopy: {
        name: 'disableCopy',
        type: { name: 'boolean' },
        description: 'Whether to disable copy button or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    formatter: {
        name: 'formatter',
        type: { name: 'function' },
        description: 'A function that receives `data` props and all props as arguments, and returns display data for value.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'function',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for value.',
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
    },
    keySlot: {
        name: 'copy',
        description: 'Slot for key.',
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
    },
    extraSlot: {
        name: 'extra',
        description: 'Slot for right space of value.',
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
    },
});
