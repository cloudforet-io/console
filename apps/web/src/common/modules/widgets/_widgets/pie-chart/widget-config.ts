import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: WidgetConfig = {
    widgetName: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        groupBy: {
            label: 'Group By',
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default pieChart;
