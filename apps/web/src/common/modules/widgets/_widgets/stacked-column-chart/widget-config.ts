import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedColumnChart: WidgetConfig = {
    widgetName: 'stackedColumnChart',
    meta: {
        title: 'Stacked Column Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        xAxis: {
            options: {
                dataTarget: 'label_field',
                default: 10,
                max: 12,
            },
        },
        stackBy: {
            options: {
                dataTarget: 'label_field',
                default: 5,
                max: 10,
            },
        },
    },
    optionalFieldsSchema: {},
};


export default stackedColumnChart;
