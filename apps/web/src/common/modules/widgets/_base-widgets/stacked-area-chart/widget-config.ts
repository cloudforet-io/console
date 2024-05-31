import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedAreaChart: WidgetConfig = {
    widgetName: 'stackedAreaChart',
    meta: {
        title: 'Stacked Area Chart',
        sizes: ['full'],
    },
    dataMappingSchema: {
        dataField: {
            label: 'Data Field',
            componentType: 'dropdown',
            required: true,
            options: {
                dataTarget: 'data_field',
            },
        },
        xAxisField: {
            label: 'X-Axis Field',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
        lineBy: {
            label: 'Line By',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    advancedOptionsSchema: {
        legend: {
            label: 'Legend',
            componentType: 'toggle',
        },
        // formatRules: {
        //     type: 'format_rules',
        //     label: 'Format Rules',
        //     options: {
        //         fields: ['number', 'text', 'color'],
        //     },
        // },
    },
};


export default stackedAreaChart;
