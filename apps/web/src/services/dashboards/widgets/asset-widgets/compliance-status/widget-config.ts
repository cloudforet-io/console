import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions,
    getWidgetInheritOptionsForFilter, getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const complianceStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'complianceStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/compliance-status/ComplianceStatusWidget.vue'),
    }),
    title: 'Compliance Status',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COMPLIANCE_STATUS.DESC',
        preview_image: 'widget-img_complianceStatus--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['md'],
    options: {
        granularity: GRANULARITY.YEARLY,
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
        default_properties: ['asset_query_set', ...getWidgetFilterSchemaPropertyNames(
            'provider',
            'project',
            'region',
            'asset_account',
        )],
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

export default complianceStatusWidgetConfig;
