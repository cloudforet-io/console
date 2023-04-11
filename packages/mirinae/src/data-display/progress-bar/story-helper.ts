import type { ArgTypes } from '@storybook/addons';

import { PROGRESS_BAR_SIZE } from '@/data-display/progress-bar/config';

export const getProgressBarArgTypes = (): ArgTypes => ({
    percentage: {
        name: 'percentage',
        type: { name: 'number' },
        description: 'Progress percentage',
        defaultValue: 50,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: {
            type: 'number',
        },
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Label text',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'text',
        },
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Progress Bar size. ${Object.values(PROGRESS_BAR_SIZE)} are available.`,
        defaultValue: PROGRESS_BAR_SIZE.md,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${PROGRESS_BAR_SIZE.md}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(PROGRESS_BAR_SIZE),
        },
    },
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'Color of tracker bar',
        defaultValue: 'undefined',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'color',
        },
    },
    gradient: {
        name: 'gradient',
        type: { name: 'object' },
        description: 'Gradient Color & Gradient Starting point of tracker bar.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'object',
        },
    },
    disableAnimation: {
        name: 'disableAnimation',
        type: { name: 'boolean' },
        description: 'Whether to disable animation or not.',
        defaultValue: false,
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: {
            type: 'boolean',
        },
    },
    /* slots */
    labelSlot: {
        name: 'label',
        description: 'Slot for label.',
        defaultValue: '',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: {
            type: 'text',
        },
    },
});
