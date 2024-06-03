import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedColumnChart: WidgetConfig = {
    widgetName: 'stackedColumnChart',
    meta: {
        title: 'Stacked Column Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        xAxisField: {
            label: 'X-Axis',
            options: {
                dataTarget: 'label_field',
            },
        },
        stackBy: {
            label: 'Stack By',
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


export default stackedColumnChart;
