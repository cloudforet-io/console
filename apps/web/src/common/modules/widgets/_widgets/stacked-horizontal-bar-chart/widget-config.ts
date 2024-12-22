import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedHorizontalBarChart: WidgetConfig = {
    widgetName: 'stackedHorizontalBarChart',
    meta: {
        title: 'Horizontal Bar Chart',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        yAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 4,
                max: 8,
                defaultIndex: 0,
                excludeDateField: true,
            },
        },
        dataField: {
            options: {
                multiSelectable: true,
                allSelected: true,
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
        numberFormat: {},
        tooltipNumberFormat: {},
        displaySeriesLabel: {},
        displayAnnotation: {},
    },
};


export default stackedHorizontalBarChart;
