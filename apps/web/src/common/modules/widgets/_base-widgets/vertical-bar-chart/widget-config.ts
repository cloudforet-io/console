import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const verticalBarChart: NewWidgetConfig = {
    widget_name: 'verticalBarChart',
    meta: {
        title: 'Vertical Bar Chart',
        sizes: ['lg', 'full'],
    },
    data_mapping_schema: {
        data_field_y: {
            label: 'Data Field (Y Axis)',
        },
        data_field_x: {
            label: 'Data Field (X Axis)',
        },
    },
    chart_options_schema: {
        max_group_by: {
            type: 'number',
            label: 'Maximum number of Group By',
        },
        max_data_field_x: {
            type: 'number',
            label: 'Maximum number of Data Field (X Axis)',
        },
    },
};


export default verticalBarChart;
