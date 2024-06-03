import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const treemap: WidgetConfig = {
    widgetName: 'treemap',
    meta: {
        title: 'Treemap',
        sizes: ['full'],
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
        categoryBy: {
            label: 'Category By',
            componentType: 'dropdown',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    advancedOptionsSchema: {
    },
};


export default treemap;
