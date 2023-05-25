import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const budgetUsageByTargetWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageByTarget',
    title: 'Budget Usage by Target',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/budget-usage-by-target/BudgetUsageByTarget.vue'),
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
        granularity: GRANULARITY.ACCUMULATED,
        cost_group_by: 'budget_id',
    },
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'region', 'cost_product'),
        schema: {
            type: 'object',
            properties: getWidgetFilterOptionsSchema('provider', 'project', 'service_account', 'cost_product', 'region'),
            order: getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'cost_product', 'region'),
        },
    },
} as WidgetConfig;

export default budgetUsageByTargetWidgetConfig;
