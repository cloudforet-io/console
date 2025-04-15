import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

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
        granularity: GRANULARITY.MONTHLY,
        chart_type: CHART_TYPE.PIE,
    },
    options_schema: getWidgetOptionsSchema([
        ['cost_data_source', { fixed: true, hidden: true }],
        ['cost_data_field', { fixed: true }],
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

export default costPieWidgetConfig;
