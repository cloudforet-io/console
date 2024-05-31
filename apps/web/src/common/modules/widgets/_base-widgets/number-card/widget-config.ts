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
            componentType: 'dropdown',
            required: true,
            options: {
                dataTarget: 'data_field',
            },
        },
    },
    advancedOptionsSchema: {
        icon: {
            label: 'Icon',
            componentType: 'icon',
        },
        comparison: {
            label: 'Comparison',
            componentType: 'comparison',
        },
    },
};


export default numberCard;
