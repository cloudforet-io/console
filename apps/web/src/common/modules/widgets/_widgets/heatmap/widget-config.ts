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
                dataTarget: 'label_field',
                default: 10,
                max: 10,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'label_field',
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
