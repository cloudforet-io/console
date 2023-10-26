import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
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
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_group_by',
        'provider',
        'project',
        'service_account',
        'project_group',
        'cost_product',
        'region',
        'cost_usage_type',
    ]),
    // non_inheritable_properties: ['cost_group_by'],
};

export default costDonutWidgetConfig;
