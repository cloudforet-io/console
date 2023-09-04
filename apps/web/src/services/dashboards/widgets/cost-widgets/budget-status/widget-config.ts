import { defineAsyncComponent } from 'vue';

import { GRANULARITY } from '@/services/dashboards/config';
import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { CHART_TYPE } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const budgetStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'budgetStatus',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/cost-widgets/budget-status/BudgetStatusWidget.vue')),
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
};

export default budgetStatusWidgetConfig;
