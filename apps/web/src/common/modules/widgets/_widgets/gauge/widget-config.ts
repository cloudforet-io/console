import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const gauge: WidgetConfig = {
    widgetName: 'gauge',
    meta: {
        title: 'Gauge',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        dataField: {},
        min: {
            options: {
                min: 0,
                max: 5,
                default: 3,
            },
        },
        max: {
            options: {
                min: 0,
                max: 5,
                default: 3,
            },
        },
        formatRules: {
            options: {
                fields: ['threshold', 'color'],
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default gauge;
