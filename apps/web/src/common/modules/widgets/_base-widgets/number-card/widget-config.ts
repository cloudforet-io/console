import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const numberCard: WidgetConfig = {
    widgetName: 'numberCard',
    meta: {
        title: 'Number Card',
        sizes: ['sm'],
    },
    dataMappingSchema: {
        dataField: {
            label: 'Data Field',
            type: 'data_field',
            required: true,
        },
    },
    advancedOptionsSchema: {
        icon: {
            label: 'Icon',
            type: 'icon',
        },
        comparison: {
            label: 'Comparison',
            type: 'comparison',
        },
    },
};


export default numberCard;
