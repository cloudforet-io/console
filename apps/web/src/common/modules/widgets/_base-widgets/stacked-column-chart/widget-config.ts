import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const stackedColumnChart: WidgetConfig = {
    widgetName: 'stackedColumnChart',
    meta: {
        title: 'Stacked Column Chart',
        sizes: ['full'],
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
        xAxisField: {
            label: 'X-Axis Field',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
        stackBy: {
            label: 'Stack By',
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


export default stackedColumnChart;
