import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { POSITIONS } from '@/data-display/tooltips/type';

export const getTooltipArgs = (): Args => ({
    tag: 'span',
    contents: 'Tooltip contents',
    defaultSlot: null,
    position: 'top',
    options: { autoHide: false },
});

export const getTooltipParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A124040',
    },
});

export const getTooltipArgTypes = (): ArgTypes => ({
    tag: {
        name: 'tag',
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'string' },
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
        type: { name: 'object' } as SBType,
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
    // default
    default: { table: { disable: true } },
});
