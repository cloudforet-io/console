import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const budgetUsageByTargetWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageByTarget',
    title: 'Budget Usage by Target',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-usage-by-target/BudgetUsageByTarget.vue'),
    }),
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_WITH_FORECAST.DESC',
        preview_image: 'widget-img_budgetUsageWithForecast--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.ACCUMULATED,
        group_by: 'budget_id',
    },
    options_schema: {
        default_properties: [`filters.${GROUP_BY.PROVIDER}`, `filters.${GROUP_BY.PROJECT}`],
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
                [`filters.${GROUP_BY.PRODUCT}`]: {
                    title: 'Product',
                    type: 'array',
                },
                [`filters.${GROUP_BY.REGION}`]: {
                    title: 'Region',
                    type: 'array',
                },
            },
        },
    },
} as WidgetConfig;

export default budgetUsageByTargetWidgetConfig;
