import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Stacked Horizontal Bar Chart',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
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
                defaultIndex: 0,
                excludeDateField: true,
            },
        },
        stackBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 30,
                defaultIndex: 1,
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
        dateFormat: {
            options: {
                default: 'MMM DD, YYYY',
            },
        },
    },
};


export default stackedHorizontalBarChart;
