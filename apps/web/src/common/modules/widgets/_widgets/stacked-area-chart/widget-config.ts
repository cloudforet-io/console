import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedAreaChart: WidgetConfig = {
    widgetName: 'stackedAreaChart',
    meta: {
        title: 'Stacked Area Chart',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            dataTarget: 'labels_info',
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 31,
                defaultIndex: 0,
            },
        },
        lineBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 10,
                defaultIndex: 0,
                excludeDateField: true,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {
            options: {
                default: true,
            },
        },
        // formatRules: {
        //     options: {
        //     },
        // },
    },
};


export default stackedAreaChart;
