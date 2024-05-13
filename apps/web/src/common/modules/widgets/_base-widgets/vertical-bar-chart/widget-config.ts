import type { NewWidgetConfig } from '@/common/modules/widgets/types/widget-config-type';

// const baseTrendWidgetConfig: WidgetConfig = {
//     widget_config_id: 'baseTrend',
//     scopes: ['PROJECT', 'WORKSPACE'],
//     theme: {
//         inherit: true,
//     },
//     sizes: ['lg', 'full'],
//     options: {
//         granularity: GRANULARITY.MONTHLY,
//         pagination_options: {
//             enabled: true,
//             page_size: 5,
//         },
//     },
// };

const VerticalBarChartWidgetConfig: NewWidgetConfig = {
    widget_name: 'baseTrend',
    meta: {
        title: 'Base Trend',
        sizes: ['lg', 'full'],
        chart_type: 'line',
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


export default VerticalBarChartWidgetConfig;
