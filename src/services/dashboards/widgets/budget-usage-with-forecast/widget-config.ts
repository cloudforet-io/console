import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const budgetUsageWithForecastWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageWithForecast',
    title: 'Budget Usage With Forecast',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-usage-with-forecast/BudgetUsageWithForecastWidget.vue'),
    }),
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_WITH_FORECAST.DESC',
        preview_image: 'xxx.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
} as WidgetConfig;

export default budgetUsageWithForecastWidgetConfig;
