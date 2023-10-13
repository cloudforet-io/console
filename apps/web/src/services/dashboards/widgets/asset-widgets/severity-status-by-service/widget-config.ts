import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions, getWidgetInheritOptionsForFilter, getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const severityStatusByServiceWidgetConfig: WidgetConfig = {
    widget_config_id: 'severityStatusByService',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/severity-status-by-service/SeverityStatusByServiceWidget.vue'),
    }),
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
        ...getWidgetInheritOptions('asset_query_set'),
        ...getWidgetInheritOptionsForFilter(
            'project',
            'provider',
            'region',
            'asset_account',
        ),
    },
    options_schema: {
        default_properties: ['asset_query_set', ...getWidgetFilterSchemaPropertyNames('project', 'provider', 'region', 'asset_account')],
        fixed_properties: ['asset_query_set'],
        schema: {
            type: 'object',
            properties: {
                ...getWidgetOptionsSchema('asset_query_set'),
                ...getWidgetFilterOptionsSchema(
                    'project',
                    // 'service_account', HACK: Re-enable it after backend is ready
                    'provider',
                    'region',
                    'asset_account',
                ),
            },
            order: ['asset_query_set', ...getWidgetFilterSchemaPropertyNames(
                'project',
                // 'service_account',
                'provider',
                'region',
                'asset_account',
            )],
        },
    },
};

export default severityStatusByServiceWidgetConfig;
