import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Stacked Horizontal Bar Chart',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            dataTarget: 'labels_info',
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        yAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 4,
                max: 8,
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


export default stackedHorizontalBarChart;
