import { faker } from '@faker-js/faker';
import type { ArgTypes } from '@storybook/addons';
import { range } from 'lodash';

import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';


export const getCollapsibleListArgTypes = (): ArgTypes => ({
    /* props */
    items: {
        name: 'items',
        type: { name: 'array' },
        description: 'List items. Array of `string` or `{title?: string; data: string;}`.',
        defaultValue: range(10).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(60) })),
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    unfoldedIndices: {
        name: 'unfoldedIndices',
        type: { name: 'array' },
        description: 'Array of collapsed item\'s index. sync props.',
        defaultValue: [],
        table: {
            type: {
                summary: 'array',
            },
            category: 'props',
            defaultValue: {
                summary: '[]',
            },
        },
        control: {
            type: 'object',
        },
    },
    lineClamp: {
        name: 'lineClamp',
        type: { name: 'number' },
        description: 'It refers to the number of content lines to be displayed in the collapsed state.',
        defaultValue: 2,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 2,
            },
        },
        control: {
            type: 'number',
        },
    },
    multiUnfoldable: {
        name: 'multiUnfoldable',
        type: { name: 'boolean' },
        description: 'Whether to allow multiple items to unfold at the same time.',
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
    togglePosition: {
        name: 'togglePosition',
        type: { name: 'string' },
        description: `Toggle position. ${Object.values(COLLAPSIBLE_LIST_TOGGLE_POSITION)} are available.`,
        defaultValue: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
            },
        },
        control: {
            type: 'select',
            options: Object.values(COLLAPSIBLE_LIST_TOGGLE_POSITION),
        },
    },
    toggleType: {
        name: 'toggleType',
        type: { name: 'string' },
        description: 'type of collapsible toggle button.',
        defaultValue: COLLAPSIBLE_TOGGLE_TYPE.text,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_TOGGLE_TYPE.text,
            },
        },
        control: {
            type: 'select',
            options: Object.values(COLLAPSIBLE_TOGGLE_TYPE),
        },
    },
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: `${Object.values(COLLAPSIBLE_LIST_THEME)} are available.`,
        defaultValue: COLLAPSIBLE_LIST_THEME.plain,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: COLLAPSIBLE_LIST_THEME.plain,
            },
        },
        control: {
            type: 'select',
            options: Object.values(COLLAPSIBLE_LIST_THEME),
        },
    },
    'v-model': {
        name: 'v-model',
        type: { name: 'array' },
        description: 'Two way binding for `unfoldedIndices` props with `update:unfolded-indices` event.',
        defaultValue: [],
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
        type: { name: 'string' },
        description: 'Slot for title.',
        defaultValue: null,
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
    defaultSlot: {
        name: 'default',
        type: { name: 'string' },
        description: 'Slot for contents.',
        defaultValue: null,
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
    /* event */
    onUpdateUnfoldedIndices: {
        name: 'update:unfolded-indices',
        description: 'Event emitted when each item\'s collapsed state changed. Works with `v-model:unfolded-indices`.',
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
