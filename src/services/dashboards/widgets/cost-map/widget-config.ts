import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';

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
        default_properties: ['group_by', `filters.${GROUP_BY.PROVIDER}`, `filters.${GROUP_BY.PROJECT}`, `filters.${GROUP_BY.SERVICE_ACCOUNT}`],
        schema: {
            type: 'object',
            properties: {
                group_by: {
                    title: 'Group by',
                    type: 'string',
                    enum: Object.values(GROUP_BY),
                    menuItems: Object.values(GROUP_BY_ITEM_MAP),
                },
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
                [`filters.${GROUP_BY.TYPE}`]: {
                    title: 'Type',
                    type: 'array',
                },
                [`filters.${GROUP_BY.ACCOUNT}`]: {
                    title: 'Account ID',
                    type: 'array',
                },
            },
            required: ['group_by'],
        },
    },
};

export default costMapWidgetConfig;
