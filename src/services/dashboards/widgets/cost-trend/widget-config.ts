import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';

const costTrendWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'costTrend',
    base_configs: [{ config_id: 'baseTrend' }],
    title: 'Cost Trend',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COST_TREND.DESC',
        preview_image: 'widget-img_costTrend--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    options: {
        granularity: 'MONTHLY',
        chart_type: CHART_TYPE.LINE,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
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

export default costTrendWidgetConfig;
