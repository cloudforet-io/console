import type { ArgTypes } from '@storybook/addons';

import { getTagItemWithFullArg } from '@/data-display/tags/mock';

export const getTagArgTypes = (): ArgTypes => ({
    keyItem: {
        name: 'keyItem',
        type: { name: 'object' },
        description: "The value for tag's key content",
        defaultValue: getTagItemWithFullArg().keyItem,
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
        type: { name: 'object' },
        description: "The value for tag's value content",
        defaultValue: getTagItemWithFullArg().valueItem,
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
        type: { name: 'object' },
        description: "The value for tag's category content",
        defaultValue: getTagItemWithFullArg().categoryItem,
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
        defaultValue: true,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: true,
            },
        },
        control: {
            type: 'boolean',
        },
    },
    outline: {
        name: 'outline',
        type: { name: 'boolean' },
        description: 'Outlined when true',
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
    selected: {
        name: 'selected',
        type: { name: 'boolean' },
        description: 'selected when true',
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
    invalid: {
        name: 'invalid',
        type: { name: 'boolean' },
        description: 'Show error icon when true',
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
    errorMessage: {
        name: 'errorMessage',
        type: { name: 'string' },
        description: 'Error Message',
        defaultValue: 'This is error message.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: '',
            },
        },
        control: {
            type: 'text',
        },
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
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    keySlot: {
        name: 'key',
        description: 'Slot to replace key item',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
    valueSlot: {
        name: 'value',
        description: 'Slot to replace value item',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
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
});
