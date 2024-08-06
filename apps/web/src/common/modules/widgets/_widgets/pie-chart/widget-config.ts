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
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 10,
                max: 15,
                defaultIndex: 0,
                excludeDateField: true,
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


export default pieChart;
