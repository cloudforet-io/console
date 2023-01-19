import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const budgetUsageSummaryConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageSummary',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-usage-summary/BudgetUsageSummaryWidget.vue'),
    }),
    title: 'Budget Usage Summary',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.DESC',
        preview_image: 'widget-img_budgetUsageSummary--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.ACCUMULATED,
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
};

export default budgetUsageSummaryConfig;
