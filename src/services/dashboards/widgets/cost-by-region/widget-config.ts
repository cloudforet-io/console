import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const costByRegionWidgetConfig: WidgetConfig = {
    widget_config_id: 'costByRegion',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-by-region/CostByRegionWidget.vue'),
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
        granularity: GRANULARITY.ACCUMULATED,
        group_by: GROUP_BY.REGION,
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
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account'),
        schema: {
            type: 'object',
            properties: getWidgetFilterOptionsSchema(
                'provider',
                'project',
                'service_account',
                'project_group',
                'category',
                'resource_group',
                'product',
                'region',
                'account',
            ),
            order: getWidgetFilterSchemaPropertyNames(
                'provider',
                'project',
                'service_account',
                'project_group',
                'category',
                'resource_group',
                'product',
                'region',
                'account',
            ),
        },
    },
};

export default costByRegionWidgetConfig;
