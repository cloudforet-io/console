import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { COST_DATA_FIELD_MAP, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const costMapWidgetConfig: WidgetConfig = {
    widget_config_id: 'costMap',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/cost-map/CostMapWidget.vue'),
    }),
    title: 'Cost Map',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_MAP.DESC',
        preview_image: 'widget-img_costMap--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['md', 'full'],
    options: {
        cost_data_field: COST_DATA_FIELD_MAP.PROJECT.name,
        granularity: GRANULARITY.MONTHLY,
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

export default costMapWidgetConfig;
