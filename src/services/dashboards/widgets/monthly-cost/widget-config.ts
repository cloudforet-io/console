import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const monthlyCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'monthlyCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/monthly-cost/MonthlyCostWidget.vue'),
    }),
    title: 'Monthly Cost',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC',
        preview_image: 'widget-img_monthlyCost--thumbnail.png',
    },
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm'],
    options: {
        granularity: GRANULARITY.MONTHLY,
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
                [`filters.${GROUP_BY.TYPE}`]: {
                    title: 'Type',
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

export default monthlyCostWidgetConfig;
