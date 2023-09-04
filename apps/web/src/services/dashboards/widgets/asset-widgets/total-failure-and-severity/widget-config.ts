import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const totalFailureAndSeverityWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailureAndSeverity',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/asset-widgets/total-failure-and-severity/TotalFailureAndSeverityWidget.vue')),
    title: 'Total Failure and Severity',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.TOTAL_FAILURE_AND_SEVERITY.DESC',
        preview_image: 'widget-img_totalFailureAndSeverity--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: true,
        inherit_count: 1,
    },
    sizes: ['lg'],
    options: {
        granularity: GRANULARITY.MONTHLY,
    },
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'region', 'asset_compliance_type', 'asset_account'),
        schema: {
            type: 'object',
            properties: {
                ...getWidgetFilterOptionsSchema(
                    'project',
                    // 'service_account', HACK: Re-enable it after backend is ready
                    'provider',
                    'region',
                    'asset_compliance_type',
                    'asset_account',
                ),
            },
            order: getWidgetFilterSchemaPropertyNames(
                'project',
                // 'service_account',
                'provider',
                'region',
                'asset_compliance_type',
                'asset_account',
            ),
        },
    },
};

export default totalFailureAndSeverityWidgetConfig;
