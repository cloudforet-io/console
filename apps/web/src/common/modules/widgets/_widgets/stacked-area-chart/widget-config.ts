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
        legend: {},
        formatRules: {
            label: 'Format Rules',
            options: {
                fields: ['dropdown', 'color'],
                dataTarget: 'legend', // TODO: this should be updated more
            },
        },
    },
};


export default stackedAreaChart;
