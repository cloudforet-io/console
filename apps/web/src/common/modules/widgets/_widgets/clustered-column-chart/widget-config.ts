import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const clusteredColumnChart: WidgetConfig = {
    widgetName: 'clusteredColumnChart',
    meta: {
        title: 'Clustered Column Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
            options: {
                dataTarget: 'data_field',
                multiSelectable: true,
            },
        },
        xAxisField: {
            label: 'X-Axis Field',
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    optionalFieldsSchema: {
        legend: {
            label: 'Legend',
        },
    },
};


export default clusteredColumnChart;
