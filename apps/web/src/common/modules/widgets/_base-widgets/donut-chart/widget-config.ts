import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const donutChart: NewWidgetConfig = {
    widget_name: 'donutChart',
    meta: {
        title: 'Donut Chart',
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


export default donutChart;
