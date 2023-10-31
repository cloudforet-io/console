import { MANAGED_VARIABLE_MODEL_CONFIGS } from '@/lib/variable-models/managed';

import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
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
        cost_group_by: 'budget_id',
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        {
            key: 'cost_data_field',
            item_options: [
                { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project.key },
                { type: 'MANAGED', key: MANAGED_VARIABLE_MODEL_CONFIGS.project_group.key },
            ],
        },
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.region',
        'filters.cost_product',
    ]),
};

export default budgetUsageByTargetWidgetConfig;
