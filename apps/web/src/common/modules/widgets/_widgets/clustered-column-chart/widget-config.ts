import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const clusteredColumnChart: WidgetConfig = {
    widgetName: 'clusteredColumnChart',
    meta: {
        title: 'Clustered Column Chart',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {
            options: {
                multiSelectable: true,
            },
        },
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 5,
                max: 8,
            },
        },
    },
    optionalFieldsSchema: {
        legend: {},
    },
};


export default clusteredColumnChart;
