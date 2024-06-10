import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const progressCard: WidgetConfig = {
    widgetName: 'progressCard',
    meta: {
        title: 'Progress Card',
        sizes: ['sm'],
    },
    requiredFieldsSchema: {
        granularity: {},
        totalField: {
            options: {
                dataTarget: 'data_info',
            },
        },
        basisField: {
            options: {
                dataTarget: 'data_info',
            },
        },
        formatRules: {
            options: {
                fields: ['threshold', 'color'],
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {
            options: {
                forTable: false,
            },
        },
    },
};


export default progressCard;
