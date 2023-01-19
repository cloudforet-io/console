import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE, GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
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

export default budgetStatusWidgetConfig;
