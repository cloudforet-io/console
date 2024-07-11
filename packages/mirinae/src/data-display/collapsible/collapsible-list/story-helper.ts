import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';


export const getCollapsibleListArgTypes = () => ({
    /* props */
    items: {
        name: 'items',
        type: 'array',
        description: 'List items. Array of `string` or `{title?: string; data: string;}`.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    unfoldedIndices: {
        name: 'unfoldedIndices',
        type: 'array',
        description: 'Array of collapsed item\'s index. sync props.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: 'object',
    },
    lineClamp: {
        name: 'lineClamp',
        type: 'number',
        description: 'It refers to the number of content lines to be displayed in the collapsed state.',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 2,
            },
        },
        control: 'number',
    },
    multiUnfoldable: {
        name: 'multiUnfoldable',
        type: 'boolean',
        description: 'Whether to allow multiple items to unfold at the same time.',
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
    togglePosition: {
        name: 'togglePosition',
        type: 'string',
        description: `Toggle position. ${Object.values(COLLAPSIBLE_LIST_TOGGLE_POSITION)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
            },
        },
        control: 'select',
        options: Object.values(COLLAPSIBLE_LIST_TOGGLE_POSITION),
    },
    toggleType: {
        name: 'toggleType',
        type: 'string',
        description: 'type of collapsible toggle button.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_TOGGLE_TYPE.text,
            },
        },
        control: 'select',
        options: Object.values(COLLAPSIBLE_TOGGLE_TYPE),
    },
    theme: {
        name: 'theme',
        type: 'string',
        description: `${Object.values(COLLAPSIBLE_LIST_THEME)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_LIST_THEME.plain,
            },
        },
        control: 'select',
        options: Object.values(COLLAPSIBLE_LIST_THEME),
    },
    'v-model': {
        name: 'v-model',
        type: 'array',
        description: 'Two way binding for `unfoldedIndices` props with `update:unfoldedIndices` event.',
        table: {
            type: {
                summary: 'array',
            },
            category: 'model',
            defaultValue: {
                summary: '[]',
            },
        },
        control: null,
    },
    /* slot */
    titleSlot: {
        name: 'title',
        type: 'string',
        description: 'Slot for title.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    noStyledTitleSlot: {
        name: 'no-styled-title',
        type: 'string',
        description: 'Slot for title without style.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    defaultSlot: {
        name: 'default',
        type: 'string',
        description: 'Slot for contents.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
    /* event */
    onUpdateUnfoldedIndices: {
        name: 'update:unfoldedIndices',
        description: 'Event emitted when each item\'s collapsed state changed. Works with `v-model` and `unfoldedIndices` props sync.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'events',
        },
    },
});
