import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

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
        granularity: GRANULARITY.MONTHLY,
        chart_type: CHART_TYPE.STACKED_COLUMN,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        cost_data_type: 'cost',
    },
    options_schema: getWidgetOptionsSchema([
        ['cost_data_source', { fixed: true, hidden: true }],
        ['cost_data_field', { fixed: true }],
        ['cost_data_type', { fixed: true }],
        ['granularity', { fixed: true, readonly: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        ['filters.service_account', { fixed: true }],
        ['filters.region', { fixed: true }],
        ['filters.cost_product', { fixed: true }],
        'filters.provider',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costTrendStackedWidgetConfig;
