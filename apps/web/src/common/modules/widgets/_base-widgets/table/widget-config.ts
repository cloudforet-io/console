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
            type: 'data_field',
            required: true,
        },
        xAxisField: {
            label: 'X-Axis Field',
            type: 'label_field',
            enableMaxCount: true,
            required: true,
        },
        groupBy: {
            label: 'Group By',
            type: 'label_field',
            multiSelectable: true,
            required: true,
        },
    },
    advancedOptionsSchema: {
        comparison: {
            label: 'Comparison',
            type: 'comparison',
        },
        subTotal: {
            label: 'Sub Total',
            type: 'sub_total',
        },
        total: {
            label: 'Total',
            type: 'total',
        },
        progressBar: {
            label: 'Progress Bar',
            type: 'progress_bar',
        },
    },
};


export default table;
