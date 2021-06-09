import { ArgTypes } from '@storybook/addons';
import { range } from 'lodash';
import faker from 'faker';

import {
    COLLAPSIBLE_LIST_THEME,
    COLLAPSIBLE_LIST_TOGGLE_POSITION,
} from '@/data-display/collapsibles/collapsible-list/config';

const getArgTypes = (): ArgTypes => {
    const argTypes: ArgTypes = {
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
            description: 'Two way binding for `unfoldedIndices` props with `update:unfoldedIndices` event.',
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
        onUpdateUnfoldedIndices: {
            name: 'update:unfoldedIndices',
            description: 'Event emitted when each item\'s collapsed state changed. Works with `v-model` and `unfoldedIndices` props sync.',
            defaultValue: null,
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
    };

    return argTypes;
};
export const argTypes: ArgTypes = getArgTypes();
