import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    base_configs: [{ config_id: 'dashboardCommon' }],
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-status/BudgetStatus.vue'),
    }),
    title: 'Budget Status',
    labels: ['Cost'],
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
        granularity: GRANULARITY.ACCUMULATED,
        group_by: 'budget_id',
    },
};

export default budgetStatusWidgetConfig;
