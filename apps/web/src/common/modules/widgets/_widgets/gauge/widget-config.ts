import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const gauge: WidgetConfig = {
    widgetName: 'gauge',
    meta: {
        title: 'Gauge',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        min: {
            label: 'Min',
            options: {
                min: 0,
                max: 5,
                default: 3,
            },
        },
        max: {
            label: 'Max',
            options: {
                min: 0,
                max: 5,
                default: 3,
            },
        },
        formatRules: {
            label: 'Format Rules',
            options: {
                fields: ['threshold', 'color'],
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default gauge;
