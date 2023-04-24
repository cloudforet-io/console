import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema, getWidgetFilterSchemaPropertyNames,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costMapWidgetConfig: WidgetConfig = {
    widget_config_id: 'costMap',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-map/CostMapWidget.vue'),
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
        group_by: GROUP_BY.PROJECT,
        granularity: GRANULARITY.ACCUMULATED,
    },
    options_schema: {
        default_properties: ['group_by', ...getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'region', 'product', 'account')],
        fixed_properties: ['group_by'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('group_by'),
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'category',
                    'resource_group',
                    'product',
                    'region',
                    'usage_type',
                    'account',
                ),
            },
            order: ['group_by', ...getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'category',
                'resource_group',
                'product',
                'region',
                'usage_type',
                'account',
            )],
        },
    },
};

export default costMapWidgetConfig;
