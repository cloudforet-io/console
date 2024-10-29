import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const numberCard: WidgetConfig = {
    widgetName: 'numberCard',
    meta: {
        title: 'Number Card',
        sizes: ['sm'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dateRange: {},
        dataField: {},
    },
    optionalFieldsSchema: {
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
        numberFormat: {},
        displayAnnotation: {},
        widgetHeight: {},
    },
};


export default numberCard;
