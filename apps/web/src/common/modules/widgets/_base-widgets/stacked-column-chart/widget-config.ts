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
            type: 'data_field',
            required: true,
        },
        xAxisField: {
            label: 'X-Axis Field',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
        stackBy: {
            label: 'Stack By',
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


export default stackedColumnChart;
