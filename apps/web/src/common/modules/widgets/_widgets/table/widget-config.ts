import type { WidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: WidgetConfig = {
    widgetName: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
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
        xAxisField: {
            label: 'X-Axis Field',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
            },
        },
        groupBy: {
            label: 'Group By',
            componentType: 'dropdownWithCount',
            required: true,
            options: {
                dataTarget: 'label_field',
                multiSelectable: true,
            },
        },
    },
    advancedOptionsSchema: {
        comparison: {
            label: 'Comparison',
            componentType: 'comparison',
        },
        subTotal: {
            label: 'Sub Total',
            componentType: 'toggle',
        },
        total: {
            label: 'Total',
            componentType: 'toggle',
        },
        progressBar: {
            label: 'Progress Bar',
            componentType: 'toggle',
        },
    },
};


export default table;
