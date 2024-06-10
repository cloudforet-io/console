import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Stacked Horizontal Bar Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        yAxis: {
            options: {
                dataTarget: 'labels_info',
                default: 4,
                max: 8,
            },
        },
        stackBy: {
            options: {
                dataTarget: 'labels_info',
                default: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default stackedHorizontalBarChart;
