import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: WidgetConfig = {
    widgetName: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
    },
    dataMappingSchema: {
        dataField: {
            label: 'Data Field',
            type: 'data_field',
            required: true,
        },
        groupBy: {
            label: 'Group By',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
    },
    advancedOptionsSchema: {
        legend: {
            label: 'Legend',
            type: 'legend',
        },
    },
};


export default pieChart;
