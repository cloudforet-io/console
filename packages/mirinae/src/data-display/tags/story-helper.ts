import { getTagItemWithFullArg } from '@/data-display/tags/mock';

export const getTagDefaultArgs = () => ({
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

export const getTagArgTypes = () => ({
    keyItem: {
        name: 'keyItem',
        type: 'object',
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
        type: 'object',
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
        type: 'object',
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
        type: 'boolean',
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
        type: 'boolean',
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
        type: 'boolean',
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
        type: 'boolean',
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
        type: 'string',
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
});
