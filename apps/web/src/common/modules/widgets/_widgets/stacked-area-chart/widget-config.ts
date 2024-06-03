import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedAreaChart: WidgetConfig = {
    widgetName: 'stackedAreaChart',
    meta: {
        title: 'Stacked Area Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        xAxisField: {
            label: 'X-Axis Field',
            options: {
                dataTarget: 'label_field',
            },
        },
        lineBy: {
            label: 'Line By',
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    optionalFieldsSchema: {
        legend: {
            label: 'Legend',
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
