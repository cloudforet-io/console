import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: WidgetConfig = {
    widgetName: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        dataField: {},
        groupBy: {
            options: {
                dataTarget: 'label_field',
                default: 10,
                max: 15,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default pieChart;
