import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const clusteredColumnChart: WidgetConfig = {
    widgetName: 'clusteredColumnChart',
    meta: {
        title: 'Clustered Column Chart',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 31,
            },
        },
        dataField: {
            options: {
                multiSelectable: true,
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


export default clusteredColumnChart;
