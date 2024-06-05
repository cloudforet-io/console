import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        yAxis: {
            options: {
                dataTarget: 'label_field',
            },
        },
        groupBy: {
            options: {
                dataTarget: 'label_field',
                // multiSelectable: true, HACK: if possible
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
