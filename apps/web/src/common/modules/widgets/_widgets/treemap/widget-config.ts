import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const treemap: WidgetConfig = {
    widgetName: 'treemap',
    meta: {
        title: 'Treemap',
        sizes: ['full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        categoryBy: {
            label: 'Category By',
            options: {
                dataTarget: 'label_field',
            },
        },
    },
    optionalFieldsSchema: {
    },
};


export default treemap;
