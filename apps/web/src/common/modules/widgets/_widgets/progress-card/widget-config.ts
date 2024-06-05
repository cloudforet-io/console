import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const progressCard: WidgetConfig = {
    widgetName: 'progressCard',
    meta: {
        title: 'Progress Card',
        sizes: ['sm'],
    },
    requiredFieldsSchema: {
        totalField: {
            options: {
                dataTarget: 'data_field',
            },
        },
        basisField: {
            options: {
                dataTarget: 'data_field',
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


export default progressCard;
