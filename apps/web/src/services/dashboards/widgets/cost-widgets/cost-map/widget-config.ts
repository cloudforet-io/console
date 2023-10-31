import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
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
        cost_group_by: COST_GROUP_BY.PROJECT,
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        {
            key: 'cost_data_field',
            item_options: [
                { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key },
            ],
        },
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

export default costMapWidgetConfig;
