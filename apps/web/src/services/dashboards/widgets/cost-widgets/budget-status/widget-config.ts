import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-status/BudgetStatusWidget.vue'),
    }),
    title: 'Budget Status',
    labels: ['Cost', 'Budget'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_STATUS.DESC',
        preview_image: 'widget-img_budgetStatus--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['sm'],
    options: {
        chart_type: CHART_TYPE.WAFFLE,
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'filters.provider',
        'filters.project',
        'filters.project_group',
    ]),
};

export default budgetStatusWidgetConfig;
