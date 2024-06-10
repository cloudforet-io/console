import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const treemap: WidgetConfig = {
    widgetName: 'treemap',
    meta: {
        title: 'Treemap',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        granularity: {},
        dataField: {},
        categoryBy: {
            options: {
                dataTarget: 'labels_info',
                default: 20,
                max: 30,
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default treemap;
