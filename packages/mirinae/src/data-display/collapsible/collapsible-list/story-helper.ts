import { faker } from '@faker-js/faker';
import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';
import { range } from 'lodash';

import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsible/collapsible-list/config';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';

export const getCollapsibleListArgs = (): Args => ({
    items: range(10).map(() => ({ title: faker.lorem.sentence(3), data: faker.lorem.sentence(60) })),
    unfoldedIndices: [],
    lineClamp: 2,
    multiUnfoldable: false,
    togglePosition: COLLAPSIBLE_LIST_TOGGLE_POSITION.title,
    toggleType: COLLAPSIBLE_TOGGLE_TYPE.text,
    theme: COLLAPSIBLE_LIST_THEME.plain,
    'v-model': [],
});

export const getCollapsibleListParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=13560%3A296687',
    },
});

export const getCollapsibleListArgTypes = (): ArgTypes => ({
    /* props */
    items: {
        name: 'items',
        type: { name: 'array' } as SBType,
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
        type: { name: 'array' } as SBType,
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
        type: { name: 'number' },
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
        type: { name: 'boolean' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'array' } as SBType,
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
    // default
    title: { table: { disable: true } },
    'no-styled-title': { table: { disable: true } },
    default: { table: { disable: true } },
});
