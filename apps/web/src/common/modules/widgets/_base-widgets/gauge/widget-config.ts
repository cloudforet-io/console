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
            componentType: 'dropdown',
            required: true,
        },
        min: {
            label: 'Min',
            componentType: 'number',
            required: true,
        },
        max: {
            label: 'Max',
            componentType: 'number',
            required: true,
        },
        formatRules: {
            label: 'Format Rules',
            componentType: 'formatRules',
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
