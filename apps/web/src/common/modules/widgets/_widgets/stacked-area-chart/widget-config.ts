import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedAreaChart: WidgetConfig = {
    widgetName: 'stackedAreaChart',
    meta: {
        title: 'Stacked Area Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                default: 5,
                max: 10,
            },
        },
        lineBy: {
            options: {
                dataTarget: 'labels_info',
                default: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
        formatRules: {
            options: {
                fields: ['dropdown', 'color'],
                dataTarget: 'legend', // TODO: this should be updated more
            },
        },
    },
};


export default stackedAreaChart;
