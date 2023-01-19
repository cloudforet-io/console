import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

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
        default_properties: [`filters.${GROUP_BY.PROVIDER}`, `filters.${GROUP_BY.PROJECT}`, `filters.${GROUP_BY.SERVICE_ACCOUNT}`],
        schema: {
            type: 'object',
            properties: {
                [`filters.${GROUP_BY.PROVIDER}`]: {
                    title: 'Provider',
                    type: 'array',
                },
                [`filters.${GROUP_BY.PROJECT}`]: {
                    title: 'Project',
                    type: 'array',
                },
                [`filters.${GROUP_BY.SERVICE_ACCOUNT}`]: {
                    title: 'Service Account',
                    type: 'array',
                },
                [`filters.${GROUP_BY.PROJECT_GROUP}`]: {
                    title: 'Project Group',
                    type: 'array',
                },
                [`filters.${GROUP_BY.CATEGORY}`]: {
                    title: 'Category',
                    type: 'array',
                },
                [`filters.${GROUP_BY.RESOURCE_GROUP}`]: {
                    title: 'Resource Group',
                    type: 'array',
                },
                [`filters.${GROUP_BY.PRODUCT}`]: {
                    title: 'Product',
                    type: 'array',
                },
                [`filters.${GROUP_BY.REGION}`]: {
                    title: 'Region',
                    type: 'array',
                },
                [`filters.${GROUP_BY.ACCOUNT}`]: {
                    title: 'Account ID',
                    type: 'array',
                },
            },
        },
    },
};

export default costByRegionWidgetConfig;
