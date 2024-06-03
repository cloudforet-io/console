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
            componentType: 'dropdown',
            required: true,
            options: {
                dataTarget: 'data_field',
            },
        },
        groupBy: {
            label: 'Group By',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    advancedOptionsSchema: {
        legend: {
            label: 'Legend',
            componentType: 'toggle',
        },
    },
};


export default pieChart;
