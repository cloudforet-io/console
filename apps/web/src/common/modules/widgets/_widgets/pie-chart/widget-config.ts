import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: WidgetConfig = {
    widgetName: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 10,
                max: 15,
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


export default pieChart;
