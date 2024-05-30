import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';


const regionMap: NewWidgetConfig = {
    widget_name: 'regionMap',
    meta: {
        title: 'Region Map',
        sizes: ['full'],
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
            label: 'Maximum number of Data Field (X Axis)',
        },
    },
};


export default regionMap;
