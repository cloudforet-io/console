import type { ArgTypes } from '@storybook/addons';

import { POSITIONS } from '@/data-display/tooltips/type';

export const getTooltipArgTypes = (): ArgTypes => ({
    tag: {
        name: 'tag',
        type: { name: 'string' },
        description: 'Root element tag',
        defaultValue: 'span',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'span',
            },
        },
        control: {
            type: 'text',
        },
    },
    contents: {
        name: 'contents',
        type: { name: 'string' },
        description: 'Tooltip contents.',
        defaultValue: 'Tooltip contents',
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
    position: {
        name: 'position',
        type: { name: 'string' },
        description: 'Position of tooltip.',
        defaultValue: 'top',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'top',
            },
        },
        control: {
            type: 'select',
            options: [...Object.values(POSITIONS)],
        },
    },
    options: {
        name: 'options',
        type: { name: 'object' },
        description: 'Options of Tooltip. This must be options of [v-tooltip](https://www.npmjs.com/package/v-tooltip#other-options).',
        defaultValue: { autoHide: false },
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: {
            type: 'object',
        },
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for contents.',
        defaultValue: null,
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
});
