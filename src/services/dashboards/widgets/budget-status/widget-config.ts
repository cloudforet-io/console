import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/config';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    base_configs: [{ config_id: 'dashboardCommon' }],
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-status/BudgetStatusWidget.vue'),
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
    },
};

export default budgetStatusWidgetConfig;
