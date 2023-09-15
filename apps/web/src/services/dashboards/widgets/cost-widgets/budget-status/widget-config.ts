import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter,
    getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/cost-widgets/budget-status/BudgetStatusWidget.vue'),
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
        granularity: GRANULARITY.YEARLY,
        cost_group_by: 'budget_id',
    },
    inherit_options: {
        ...getWidgetInheritOptions('cost_data_source'),
        ...getWidgetInheritOptionsForFilter(
            'project',
            'region',
            'cost_product',
        ),
    },
    options_schema: {
        default_properties: [
            'cost_data_source',
            ...getWidgetFilterSchemaPropertyNames(
                'project',
                'region',
                'cost_product',
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
                    'cost_product',
                    'region',
                ),
            },
            order: [
                'cost_data_source',
                ...getWidgetFilterSchemaPropertyNames(
                    'project',
                    'service_account',
                    'cost_product',
                    'region',
                ),
            ],
        },
    },
};

export default budgetStatusWidgetConfig;
