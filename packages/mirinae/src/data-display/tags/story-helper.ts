import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { getTagItemWithFullArg } from '@/data-display/tags/mock';

export const getTagArgs = (): Args => ({
    keyItem: getTagItemWithFullArg().keyItem,
    valueItem: getTagItemWithFullArg().valueItem,
    categoryItem: getTagItemWithFullArg().categoryItem,
    deletable: true,
    outline: false,
    selected: false,
    invalid: false,
    errorMessage: 'This is error message.',
    categorySlot: '',
    keySlot: '',
    valueSlot: '',
});

export const getTagParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124044',
    },
});

export const getTagArgTypes = (): ArgTypes => ({
    keyItem: {
        name: 'keyItem',
        type: { name: 'object' } as SBType,
        description: "The value for tag's key content",
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    valueItem: {
        name: 'valueItem',
        type: { name: 'object' } as SBType,
        description: "The value for tag's value content",
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    categoryItem: {
        name: 'categoryItem',
        type: { name: 'object' } as SBType,
        description: "The value for tag's category content",
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: undefined,
            },
        },
    },
    deletable: {
        name: 'deletable',
        type: { name: 'boolean' },
        description: 'Deletable when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: 'boolean',
    },
    outline: {
        name: 'outline',
        type: { name: 'boolean' },
        description: 'Outlined when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'selected when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Show error icon when true',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: false,
            },
        },
        control: 'boolean',
    },
    errorMessage: {
        name: 'errorMessage',
        type: { name: 'string' },
        description: 'Error Message',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: 'text',
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot to replace contents composed of key, value, category',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
    categorySlot: {
        name: 'category',
        description: 'Slot to replace category item',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    keySlot: {
        name: 'key',
        description: 'Slot to replace key item',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    valueSlot: {
        name: 'value',
        description: 'Slot to replace value item',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    /* events */
    onDelete: {
        name: 'delete',
        description: 'Emitted when the deleted button is clicked',
        table: {
            type: {
                summary: null,
            },
            category: 'events',
        },
    },
    // default
    default: { table: { disable: true } },
    category: { table: { disable: true } },
    key: { table: { disable: true } },
    value: { table: { disable: true } },
    delete: { table: { disable: true } },
});
