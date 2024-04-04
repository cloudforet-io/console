import { CHART_TYPE, COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';

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
        ['granularity', { readonly: true }],
        'filters.provider',
        'filters.project_group',
        'filters.project',
        'filters.service_account',
        'filters.region',
        'filters.cost_product',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costTrendStackedWidgetConfig;
