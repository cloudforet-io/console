import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

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
        granularity: GRANULARITY.YEARLY,
    },
    options_schema: {
        default_properties: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
            'provider',
            'project',
            'service_account',
            'region',
            'cost_product',
        )],
        fixed_properties: ['cost_data_source', 'cost_group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source', 'cost_group_by'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'cost_product',
                    'region',
                    'cost_usage_type',
                ),
            },
            order: ['cost_data_source', 'cost_group_by', ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'cost_product',
                'region',
                'cost_usage_type',
            )],
        },
    },
};

export default costMapWidgetConfig;
