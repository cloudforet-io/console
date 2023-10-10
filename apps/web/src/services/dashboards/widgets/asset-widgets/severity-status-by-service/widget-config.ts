import { defineAsyncComponent } from 'vue';

import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptionsForFilter,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const severityStatusByServiceWidgetConfig: WidgetConfig = {
    widget_config_id: 'severityStatusByService',
    widget_component: defineAsyncComponent(() => import('@/services/dashboards/widgets/asset-widgets/severity-status-by-service/SeverityStatusByServiceWidget.vue')),
    title: 'Severity Status by Service',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.SEVERITY_STATUS_BY_SERVICE.DESC',
        preview_image: 'widget-img_severityStatusByService--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['full'],
    options: {
        granularity: GRANULARITY.YEARLY,
        legend_options: {
            enabled: true,
            show_at: 'chart',
        },
    },
    inherit_options: {
        ...getWidgetInheritOptionsForFilter(
            'project',
            'provider',
            'region',
            'asset_compliance_framework',
            'asset_account',
        ),
    },
    options_schema: {
        default_properties: getWidgetFilterSchemaPropertyNames('project', 'provider', 'region', 'asset_compliance_framework', 'asset_account'),
        schema: {
            type: 'object',
            properties: {
                ...getWidgetFilterOptionsSchema(
                    'project',
                    // 'service_account', HACK: Re-enable it after backend is ready
                    'provider',
                    'region',
                    'asset_compliance_framework',
                    'asset_account',
                ),
            },
            order: getWidgetFilterSchemaPropertyNames(
                'project',
                // 'service_account',
                'provider',
                'region',
                'asset_compliance_framework',
                'asset_account',
            ),
        },
    },
};

export default severityStatusByServiceWidgetConfig;
