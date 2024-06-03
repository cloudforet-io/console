import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const lineChart: WidgetConfig = {
    widgetName: 'lineChart',
    meta: {
        title: 'Line Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        xAxisField: {
            label: 'X-Axis Field',
            options: {
                dataTarget: 'label_field',
            },
        },
        lineBy: {
            label: 'Line By',
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


export default lineChart;
