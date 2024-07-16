import { POSITIONS } from '@/data-display/tooltips/type';

export const getTooltipDefaultArgs = () => ({
    tag: 'span',
    contents: 'Tooltip contents',
    defaultSlot: undefined,
    position: 'top',
    options: { autoHide: false },
});

export const getTooltipArgTypes = () => ({
    tag: {
        name: 'tag',
        type: 'string',
        description: 'Root element tag',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'span',
            },
        },
        control: 'text',
    },
    contents: {
        name: 'contents',
        type: 'string',
        description: 'Tooltip contents.',
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
    position: {
        name: 'position',
        type: 'string',
        description: 'Position of tooltip.',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'top',
            },
        },
        control: 'select',
        options: [...Object.values(POSITIONS)],
    },
    options: {
        name: 'options',
        type: 'object',
        description: 'Options of Tooltip. This must be options of [v-tooltip](https://www.npmjs.com/package/v-tooltip#other-options).',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: '{}',
            },
        },
        control: 'object',
    },
    /* slots */
    defaultSlot: {
        name: 'default',
        description: 'Slot for contents.',
        table: {
            type: {
                summary: null,
            },
            category: 'slots',
        },
    },
});
