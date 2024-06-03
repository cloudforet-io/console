import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const heatmap: WidgetConfig = {
    widgetName: 'heatmap',
    meta: {
        title: 'Heatmap',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        yAxisField: {
            label: 'Y-Axis',
            options: {
                dataTarget: 'label_field',
            },
        },
        groupBy: {
            label: 'Group By',
            options: {
                dataTarget: 'label_field',
                // multiSelectable: true, HACK: if possible
            },
        },
        formatRules: {
            label: 'Format Rules',
            options: {
                fields: ['name', 'threshold', 'color'],
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default heatmap;
