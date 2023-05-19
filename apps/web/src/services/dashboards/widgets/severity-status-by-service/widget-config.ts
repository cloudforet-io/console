import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const severityStatusByServiceWidgetConfig: WidgetConfig = {
    widget_config_id: 'severityStatusByService',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/severity-status-by-service/SeverityStatusByServiceWidget.vue'),
    }),
    title: 'Severity Status by Service',
    labels: ['Asset'],
    description: {
        // translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC',
        // preview_image: 'widget-img_monthlyCost--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['full'],
    options: {
        granularity: GRANULARITY.ACCUMULATED,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
    },
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'account'),
        schema: {
            type: 'object',
            properties: {
                ...getWidgetFilterOptionsSchema(
                    'project',
                    'service_account',
                    'provider',
                    // 'compliance_type',
                    'account',
                ),
            },
            order: getWidgetFilterSchemaPropertyNames(
                'project',
                'service_account',
                'provider',
                // 'compliance_type',
                'account',
            ),
        },
    },
};

export default severityStatusByServiceWidgetConfig;
