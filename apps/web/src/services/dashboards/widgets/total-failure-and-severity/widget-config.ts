import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const totalFailureAndSeverityWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailureAndSeverity',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/total-failure-and-severity/TotalFailureAndSeverityWidget.vue'),
    }),
    title: 'Total Failure and Severity',
    labels: ['Asset'],
    description: {
        // translation_id: 'DASHBOARDS.WIDGET.MONTHLY_COST.DESC', // TODO: Add translation
        preview_image: 'widget-img_totalFailureAndSeverity--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'service_account', 'region', 'asset_compliance_type', 'asset_account'),
        schema: {
            type: 'object',
            properties: {
                ...getWidgetFilterOptionsSchema(
                    'project',
                    'service_account',
                    'provider',
                    'region',
                    'asset_compliance_type',
                    'asset_account',
                ),
            },
            order: getWidgetFilterSchemaPropertyNames(
                'project',
                'service_account',
                'provider',
                'region',
                'asset_compliance_type',
                'asset_account',
            ),
        },
    },
};

export default totalFailureAndSeverityWidgetConfig;
