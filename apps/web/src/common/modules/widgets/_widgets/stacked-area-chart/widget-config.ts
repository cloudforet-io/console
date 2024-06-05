import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedAreaChart: WidgetConfig = {
    widgetName: 'stackedAreaChart',
    meta: {
        title: 'Stacked Area Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        xAxisField: {
            options: {
                dataTarget: 'label_field',
            },
        },
        lineBy: {
            options: {
                dataTarget: 'label_field',
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
