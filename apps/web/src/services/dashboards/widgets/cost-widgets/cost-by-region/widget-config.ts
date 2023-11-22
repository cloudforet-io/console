import { CHART_TYPE, COST_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costByRegionWidgetConfig: WidgetConfig = {
    widget_config_id: 'costByRegion',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-by-region/CostByRegionWidget.vue'),
    }),
    title: 'Cost by Region',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_BY_REGION.DESC',
        preview_image: 'widget-img_costByRegion--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        cost_data_field: COST_DATA_FIELD_MAP.REGION.name,
        chart_type: CHART_TYPE.MAP,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        pagination_options: {
            enabled: true,
            page_size: 10,
        },
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        ['cost_data_field', { readonly: true }],
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

export default costByRegionWidgetConfig;
