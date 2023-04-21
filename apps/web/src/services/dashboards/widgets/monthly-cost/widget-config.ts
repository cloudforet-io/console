import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const monthlyCostWidgetConfig: WidgetConfig = {
    widget_config_id: 'monthlyCost',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/monthly-cost/MonthlyCostWidget.vue'),
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
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'region'),
        schema: {
            type: 'object',
            properties: {
                ...getWidgetFilterOptionsSchema(
                    'provider',
                    'project',
                    'service_account',
                    'project_group',
                    'category',
                    'resource_group',
                    'product',
                    'region',
                    'usage_type',
                    'account',
                ),
            },
        },
    },
};

export default monthlyCostWidgetConfig;
