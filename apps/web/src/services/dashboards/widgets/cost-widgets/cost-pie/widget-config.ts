import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costPieWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costPie',
    title: 'Cost Pie',
    labels: ['Cost'],
    base_configs: [{ config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_PIE.DESC',
        preview_image: 'widget-img_costPie--thumbnail.png',
    },
    options: {
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        cost_data_type: 'cost',
        granularity: GRANULARITY.MONTHLY,
        chart_type: CHART_TYPE.PIE,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_data_field',
        'cost_data_type',
        ['granularity', { fixed: true, readonly: true }],
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

export default costPieWidgetConfig;
