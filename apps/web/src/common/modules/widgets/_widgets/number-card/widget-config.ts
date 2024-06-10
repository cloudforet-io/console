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
        icon: {},
        comparison: {
            options: {
                forTable: false,
            },
        },
    },
};


export default numberCard;
