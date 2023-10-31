import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costTrendWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costTrend',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND.DESC',
        preview_image: 'widget-img_costTrend--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    options: {
        granularity: 'MONTHLY',
        chart_type: CHART_TYPE.LINE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        cost_data_field: MANAGED_VARIABLE_MODEL_CONFIGS.project.key,
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
        'cost_usage_type',
    ]),
};

export default costTrendWidgetConfig;
