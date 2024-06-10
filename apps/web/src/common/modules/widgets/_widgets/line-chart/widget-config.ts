import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const lineChart: WidgetConfig = {
    widgetName: 'lineChart',
    meta: {
        title: 'Line Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        xAxis: {
            options: {
                dataTarget: 'label_field',
                default: 5,
                max: 10,
            },
        },
        lineBy: {
            options: {
                dataTarget: 'label_field',
                default: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default lineChart;
