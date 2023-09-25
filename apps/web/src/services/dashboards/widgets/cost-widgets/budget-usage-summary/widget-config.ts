import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const budgetUsageSummaryConfig: WidgetConfig = {
    widget_config_id: 'budgetUsageSummary',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-usage-summary/BudgetUsageSummaryWidget.vue'),
    }),
    title: 'Budget Usage Summary',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.BUDGET_USAGE_SUMMARY.DESC',
        preview_image: 'widget-img_budgetUsageSummary--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['sm', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
    },
    inherit_options: {
        ...getWidgetInheritOptions('cost_data_source'),
        ...getWidgetInheritOptionsForFilter(
            'project',
            'service_account',
        ),
    },
    options_schema: {
        default_properties: [
            'cost_data_source',
            ...getWidgetFilterSchemaPropertyNames(
                'project',
            ),
        ],
        fixed_properties: ['cost_data_source'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('cost_data_source'),
                ...getWidgetFilterOptionsSchema(
                    'project',
                    'service_account',
                ),
            },
            order: [
                'cost_data_source',
                ...getWidgetFilterSchemaPropertyNames(
                    'project',
                    'service_account',
                ),
            ],
        },
    },
};

export default budgetUsageSummaryConfig;
