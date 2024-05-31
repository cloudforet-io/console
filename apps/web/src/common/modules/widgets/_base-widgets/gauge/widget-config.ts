import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const gauge: WidgetConfig = {
    widgetName: 'gauge',
    meta: {
        title: 'Gauge',
        sizes: ['full'],
    },
    dataMappingSchema: {
        dataField: {
            label: 'Data Field',
            type: 'data_field',
            required: true,
        },
        min: {
            label: 'Min',
            type: 'number',
            required: true,
        },
        max: {
            label: 'Max',
            type: 'number',
            required: true,
        },
        formatRules: {
            label: 'Format Rules',
            type: 'format_rules',
            options: {
                fields: ['threshold', 'color'],
            },
            required: true,
        },
    },
    advancedOptionsSchema: {
    },
};


export default gauge;
