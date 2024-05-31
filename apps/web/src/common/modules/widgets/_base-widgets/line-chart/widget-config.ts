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
            type: 'data_field',
            required: true,
        },
        xAxisField: {
            label: 'X-Axis Field',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
        lineBy: {
            label: 'Line By',
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


export default lineChart;
