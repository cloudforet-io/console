import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const clusteredColumnChart: WidgetConfig = {
    widgetName: 'clusteredColumnChart',
    meta: {
        title: 'Clustered Column Chart',
        sizes: ['full'],
    },
    dataMappingSchema: {
        dataField: {
            label: 'Data Field',
            type: 'data_field',
            multiSelectable: true,
            required: true,
        },
        xAxisField: {
            label: 'X-Axis Field',
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


export default clusteredColumnChart;
