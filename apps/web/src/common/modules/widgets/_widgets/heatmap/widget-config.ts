import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
        defaultValidationConfig: {
            dataTarget: 'labels_info',
            defaultMaxCount: 2,
        },
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 10,
                max: 10,
                defaultIndex: 0,
            },
        },
        yAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 7,
                max: 14,
                defaultIndex: 1,
            },
        },
        colorSchema: {},
    },
    optionalFieldsSchema: {
        legend: {
            options: {
                default: true,
            },
        },
    },
};


export default heatmap;
