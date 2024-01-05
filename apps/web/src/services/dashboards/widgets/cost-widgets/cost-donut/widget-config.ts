import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';

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
        cost_data_field: COST_DATA_FIELD_MAP.PROVIDER.name,
        granularity: GRANULARITY.MONTHLY,
        chart_type: CHART_TYPE.DONUT,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_data_field',
        ['granularity', { fixed: true, readonly: true }],
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.cost_product',
        'filters.region',
        'filters.cost_usage_type',
        'filters.cost_additional_info_value',
        'filters.cost_tag_value',
    ]),
};

export default costDonutWidgetConfig;
