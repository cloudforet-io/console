import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        dataField: {},
        xAxisField: {
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
            },
        },
        groupBy: {
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {},
        subTotal: {},
        total: {},
        progressBar: {},
    },
};


export default table;
