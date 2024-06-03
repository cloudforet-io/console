import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const lineChart: WidgetConfig = {
    widgetName: 'lineChart',
    meta: {
        title: 'Line Chart',
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
        lineBy: {
            label: 'Line By',
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


export default lineChart;
