import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 10,
                max: 10,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                defaultMaxCount: 7,
                max: 14,
                multiSelectable: false,
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default heatmap;
