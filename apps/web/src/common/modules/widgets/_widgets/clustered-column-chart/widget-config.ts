import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const clusteredColumnChart: WidgetConfig = {
    widgetName: 'clusteredColumnChart',
    meta: {
        title: 'Clustered Column Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            options: {
                multiSelectable: true,
            },
        },
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                default: 5,
                max: 8,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default clusteredColumnChart;
