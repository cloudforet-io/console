import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const numberCard: WidgetConfig = {
    widgetName: 'numberCard',
    meta: {
        title: 'Number Card',
        sizes: ['sm'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
    },
    optionalFieldsSchema: {
        abbreviation: {
            options: {
                toggle: true,
            },
        },
        icon: {
            options: {
                toggle: true,
            },
        },
        comparison: {
            options: {
                toggle: true,
            },
        },
    },
};


export default numberCard;
