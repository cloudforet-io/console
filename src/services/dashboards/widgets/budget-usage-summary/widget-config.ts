import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const budgetUsageSummaryConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageSummary',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-usage-summary/BudgetUsageSummaryWidget.vue'),
    }),
    title: 'Budget Usage Summary',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm', 'full'],
};

export default budgetUsageSummaryConfig;
