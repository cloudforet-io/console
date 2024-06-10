import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const gauge: WidgetConfig = {
    widgetName: 'gauge',
    meta: {
        title: 'Gauge',
        sizes: ['md'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        min: {
            options: {
                default: 3,
            },
        },
        max: {
            options: {
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
