import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const progressCard: WidgetConfig = {
    widgetName: 'progressCard',
    meta: {
        title: 'Progress Card',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        totalField: {
            label: 'Total Field',
            options: {
                dataTarget: 'data_field',
            },
        },
        basisField: {
            label: 'Basis Field',
            options: {
                dataTarget: 'data_field',
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


export default progressCard;
