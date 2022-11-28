import type { ArgTypes } from '@storybook/addons';

import {
    DEFAULT_NAME_OPTIONS, DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_TYPE, DYNAMIC_CHART_THEMES,
} from '@/data-display/dynamic/dynamic-chart/config';


export const getDynamicChartArgTypes = (): ArgTypes => ({
    type: {
        name: 'type',
        type: { name: 'string', required: true },
        description: 'The type of chart.',
        defaultValue: DYNAMIC_CHART_TYPE[0],
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DYNAMIC_CHART_TYPE[0],
            },
        },
        control: {
            type: 'select',
            options: DYNAMIC_CHART_TYPE,
        },
    },
    loading: {
        name: 'loading',
        type: { name: 'boolean' },
        description: 'Whether to show loader or not.',
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
    data: {
        name: 'data',
        type: { name: 'array' },
        description: 'Data to display.',
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
    valueOptions: {
        name: 'valueOptions',
        type: { name: 'object' },
        description: 'The display options for value. `DynamicField` type.',
        defaultValue: DEFAULT_VALUE_OPTIONS,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: `${DEFAULT_VALUE_OPTIONS}`,
            },
        },
        control: {
            type: 'object',
        },
    },
    nameOptions: {
        name: 'nameOptions',
        type: { name: 'object' },
        description: 'The display options for label or legend of value. `DynamicField` type.',
        defaultValue: DEFAULT_NAME_OPTIONS,
        table: {
            type: {
                summary: 'object',
            },
            category: 'props',
            defaultValue: {
                summary: `${DEFAULT_NAME_OPTIONS}`,
            },
        },
        control: {
            type: 'object',
        },
    },
    fieldHandler: {
        name: 'fieldHandler',
        type: { name: 'func' },
        description: 'Handler that executed for handling dynamic field props that bound to dynamic field component.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'func',
            },
            category: 'props',
            defaultValue: {
                summary: null,
            },
        },
        control: null,
    },
    theme: {
        name: 'theme',
        type: { name: 'string' },
        description: `The theme of chart. ${DYNAMIC_CHART_THEMES.map((d) => `'${d}'`)} are available.`,
        defaultValue: DYNAMIC_CHART_THEMES[0],
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: DYNAMIC_CHART_THEMES[0],
            },
        },
        control: {
            type: 'select',
            options: DYNAMIC_CHART_THEMES,
        },
    },
    limit: {
        name: 'limit',
        type: { name: 'number' },
        description: 'A number that determines how many pieces of data to display.',
        defaultValue: undefined,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 'undefined',
            },
        },
        control: {
            type: 'number',
        },
    },
});
