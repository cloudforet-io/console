import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedColumnChart: WidgetConfig = {
    widgetName: 'stackedColumnChart',
    meta: {
        title: 'Stacked Column Chart',
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
                defaultMaxCount: 10,
                max: 12,
            },
        },
        stackBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {
            options: {
                default: true,
            },
        },
    },
};


export default stackedColumnChart;
