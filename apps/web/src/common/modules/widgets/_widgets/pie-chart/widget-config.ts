import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: WidgetConfig = {
    widgetName: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
        defaultValidationConfig: {
            defaultMaxCount: 1,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 10,
                max: 15,
                defaultIndex: 0,
            },
        },
        pieChartType: {
            options: {
                default: 'pie',
            },
        },
    },
    optionalFieldsSchema: {
        legend: {
            options: {
                toggle: true,
                showPositionField: true,
            },
        },
        dateFormat: {
            options: {
                default: 'MMM DD, YYYY',
            },
        },
        numberFormat: {},
        tooltipNumberFormat: {},
        displaySeriesLabel: {
            options: {
                showFormatField: true,
            },
        },
        displayAnnotation: {},
    },
};


export default pieChart;
