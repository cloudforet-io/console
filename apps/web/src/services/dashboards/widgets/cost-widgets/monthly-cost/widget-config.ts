import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';


const monthlyCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'monthlyCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/monthly-cost/MonthlyCostWidget.vue'),
    }),
    title: 'Monthly Cost',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC',
        preview_image: 'widget-img_monthlyCost--thumbnail.png',
    },
    scopes: ['DOMAIN', 'PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm'],
    options: {
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: getWidgetOptionsSchema([
        'cost_data_source',
        'filters.provider',
        'filters.project',
        'filters.service_account',
        'filters.project_group',
        'filters.cost_product',
        'filters.region',
        'cost_usage_type',
    ]),
};

export default monthlyCostWidgetConfig;
