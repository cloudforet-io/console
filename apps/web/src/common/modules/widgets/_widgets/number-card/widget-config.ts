import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const numberCard: WidgetConfig = {
    widgetName: 'numberCard',
    meta: {
        title: 'Number Card',
        sizes: ['sm'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
            options: {
                dataTarget: 'data_field',
            },
        },
    },
    optionalFieldsSchema: {
        icon: {
            label: 'Icon',
        },
        comparison: {
            label: 'Comparison',
        },
    },
};


export default numberCard;
