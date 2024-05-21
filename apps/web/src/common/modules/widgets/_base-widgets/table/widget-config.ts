import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const table: NewWidgetConfig = {
    widget_name: 'table',
    meta: {
        title: 'Table',
        sizes: ['md', 'full'],
    },
    data_mapping_schema: {
        data_field_y: {
            label: 'Data Field (Y Axis)',
        },
        data_field_x: {
            label: 'Data Field (X Axis)',
            enable_granularity: true,
        },
    },
    chart_options_schema: {
        max_data_field_x: {
            type: 'number',
            label: 'Maximum number of Group By',
        },
        comparison: {
            type: 'comparison',
            label: 'Comparison',
        },
        sub_total: {
            type: 'boolean',
            label: 'Sub Total',
        },
        total: {
            type: 'boolean',
            label: 'Total',
        },
        progress: {
            type: 'boolean',
            label: 'Progress',
        },
        format_rules: {
            type: 'format_rules',
            label: 'Format Rules',
            fields: ['text', 'color'],
        },
    },
};


export default table;
