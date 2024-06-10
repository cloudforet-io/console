import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        xAxis: {
            options: {
                dataTarget: 'labels_info',
                default: 10,
                max: 10,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'labels_info',
                default: 7,
                max: 14,
            },
        },
        formatRules: {
            options: {
                fields: ['name', 'threshold', 'color'],
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default heatmap;
