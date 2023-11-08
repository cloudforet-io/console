import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_DATA_FIELD_MAP } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costTrendStackedWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costTrendStacked',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend Stacked',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND_STACKED.DESC',
        preview_image: 'widget-img_costTrendStacked--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    options: {
        chart_type: CHART_TYPE.STACKED_COLUMN,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        cost_data_type: 'cost',
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_data_field',
        'cost_data_type',
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.region',
        'filters.project_group',
        'filters.cost_product',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costTrendStackedWidgetConfig;
