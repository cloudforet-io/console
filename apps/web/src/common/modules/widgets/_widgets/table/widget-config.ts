import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    requiredFieldsSchema: {
        dataField: {
            label: 'Data Field',
        },
        xAxisField: {
            label: 'X-Axis Field',
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
            },
        },
        groupBy: {
            label: 'Group By',
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
            },
        },
    },
    optionalFieldsSchema: {
        comparison: {
            label: 'Comparison',
        },
        subTotal: {
            label: 'Sub Total',
        },
        total: {
            label: 'Total',
        },
        progressBar: {
            label: 'Progress Bar',
        },
    },
};


export default table;
