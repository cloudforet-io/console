import type { SBType } from '@storybook/types';
import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { PROGRESS_BAR_SIZE } from '@/data-display/progress-bar/config';

export const getProgressBarArgs = (): Args => ({
    percentage: 50,
    label: undefined,
    size: PROGRESS_BAR_SIZE.md,
    color: 'undefined',
    gradient: undefined,
    disableAnimation: false,
    height: 'undefined',
    labelSlot: '',
});

export const getProgressBarParameters = (): Parameters => ({
    design: {
        type: 'figma',
        url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=2667%3A173604',
    },
});

export const getProgressBarArgTypes = (): ArgTypes => ({
    percentage: {
        name: 'percentage',
        type: { name: 'number' },
        description: 'Progress percentage',
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 0,
            },
        },
        control: 'number',
    },
    label: {
        name: 'label',
        type: { name: 'string' },
        description: 'Label text',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    size: {
        name: 'size',
        type: { name: 'string' },
        description: `Progress Bar size. ${Object.values(PROGRESS_BAR_SIZE)} are available.`,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${PROGRESS_BAR_SIZE.md}"`,
            },
        },
        control: 'select',
        options: Object.values(PROGRESS_BAR_SIZE),
    },
    color: {
        name: 'color',
        type: { name: 'string' },
        description: 'Color of tracker bar',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'color',
    },
    gradient: {
        name: 'gradient',
        type: { name: 'object' } as SBType,
        description: 'Gradient Color & Gradient Starting point of tracker bar.',
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'object',
    },
    disableAnimation: {
        name: 'disableAnimation',
        type: { name: 'boolean' },
        description: 'Whether to disable animation or not.',
        table: {
            type: {
                summary: 'boolean',
            },
            category: 'props',
            defaultValue: {
                summary: 'false',
            },
        },
        control: 'boolean',
    },
    height: {
        name: 'height',
        type: { name: 'string' },
        description: 'Height of progress bar',
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: 'text',
    },
    /* slots */
    labelSlot: {
        name: 'label',
        description: 'Slot for label.',
        table: {
            type: {
                summary: null,
            },
            defaultValue: {
                summary: null,
            },
            category: 'slots',
        },
        control: 'text',
    },
});
