import { ArgTypes } from '@storybook/addons';
import { DYNAMIC_WIDGET_TYPE } from '@/data-display/dynamic/dynamic-widget/type';
import { getDynamicChartArgTypes } from '@/data-display/dynamic/dynamic-chart/story-helper';

export const getDynamicWidgetArgTypes = (): ArgTypes => {
    const dynamicWidgetArgTypes: ArgTypes = {
        type: {
            name: 'type',
            type: { name: 'string', required: true },
            description: 'The type of widget.',
            defaultValue: DYNAMIC_WIDGET_TYPE[0],
            table: {
                type: {
                    summary: 'string',
                },
                category: 'props',
                defaultValue: {
                    summary: DYNAMIC_WIDGET_TYPE[0],
                },
            },
            control: {
                type: 'select',
                options: DYNAMIC_WIDGET_TYPE,
            },
        },
        name: {
            name: 'name',
            type: { name: 'string', required: true },
            description: 'The name of widget.',
            defaultValue: '',
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
        data: {
            name: 'data',
            type: { name: 'any' },
            description: 'Data to display.',
            defaultValue: {},
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
        schemaOptions: {
            name: 'schemaOptions',
            type: { name: 'object' },
            description: 'The schema options for widget. `DynamicWidgetSchemaOptions` type. Different by type.',
            defaultValue: {},
            table: {
                type: {
                    summary: 'object',
                },
                category: 'props',
                defaultValue: {
                    summary: '{}',
                },
            },
            control: null,
        },
        viewOptions: {
            name: 'viewOptions',
            type: { name: 'object' },
            description: 'The view options for widget. `DynamicWidgetViewOptions` type.',
            defaultValue: {},
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
    };

    const dynamicChartArgTypes = getDynamicChartArgTypes();

    const dynamicChartPropsToSchemaOptions = {
        type: 'chart_type',
        valueOptions: 'value_options',
        nameOptions: 'name_options',
    };

    Object.keys(dynamicChartPropsToSchemaOptions).forEach((chartProp) => {
        const schemaOptionKey = dynamicChartPropsToSchemaOptions[chartProp];
        dynamicChartArgTypes[chartProp].name = schemaOptionKey;
        dynamicChartArgTypes[chartProp].table.category = 'schemaOptions';
        dynamicWidgetArgTypes[schemaOptionKey] = dynamicChartArgTypes[chartProp];
    });

    return dynamicWidgetArgTypes;
};
