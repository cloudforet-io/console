import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costDonutWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costDonut',
    title: 'Cost Donut',
    labels: ['Cost'],
    base_configs: [{ config_id: 'basePie' }],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_DONUT.DESC',
        preview_image: 'widget-img_costDonut--thumbnail.png',
    },
    options: {
        chart_type: CHART_TYPE.DONUT,
        cost_data_field: COST_GROUP_BY.PROVIDER,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_data_field',
        'cost_data_type',
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.project_group',
        'filters.cost_product',
        'filters.region',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costDonutWidgetConfig;
