import { ArgTypes } from '@storybook/addons';
import { DEFAULT_NAME_OPTIONS, DEFAULT_VALUE_OPTIONS, DYNAMIC_CHART_TYPE } from '@/data-display/dynamic/dynamic-chart/config';

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
    data: {
        name: 'data',
        type: { name: 'any' },
        description: 'Data to display.',
        defaultValue: 'data',
        table: {
            type: {
                summary: 'any',
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
    limit: {
        name: 'limit',
        type: { name: 'number' },
        description: 'The limit count of table data row.',
        defaultValue: 10,
        table: {
            type: {
                summary: 'number',
            },
            category: 'props',
            defaultValue: {
                summary: 10,
            },
        },
        control: {
            type: 'number',
        },
    },
});
