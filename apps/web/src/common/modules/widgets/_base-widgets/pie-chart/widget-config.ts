import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const pieChart: NewWidgetConfig = {
    widget_name: 'pieChart',
    meta: {
        title: 'Pie Chart',
        sizes: ['md'],
    },
    data_mapping_schema: {
        data_field: {
            label: 'Data Field',
        },
    },
    chart_options_schema: {
        max_group_by: {
            type: 'number',
            label: 'Maximum number of Group By',
        },
    },
};


export default pieChart;
