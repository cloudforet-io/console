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
            type: 'data_field',
            required: true,
        },
        xAxisField: {
            label: 'X-Axis Field',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
        lineBy: {
            label: 'Line By',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
    },
    advancedOptionsSchema: {
        legend: {
            label: 'Legend',
            type: 'legend',
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
