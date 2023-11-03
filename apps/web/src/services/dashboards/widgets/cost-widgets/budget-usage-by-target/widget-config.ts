import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const budgetUsageByTargetWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageByTarget',
    title: 'Budget Usage by Target',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-usage-by-target/BudgetUsageByTargetWidget.vue'),
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
        granularity: GRANULARITY.MONTHLY,
        cost_data_field: COST_GROUP_BY.PROJECT,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'cost_data_field',
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.region',
        'filters.cost_product',
    ]),
};

export default budgetUsageByTargetWidgetConfig;
