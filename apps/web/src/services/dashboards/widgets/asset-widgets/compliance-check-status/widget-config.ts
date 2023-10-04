import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames,
    getWidgetInheritOptionsForFilter,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const complianceCheckStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'complianceCheckStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/compliance-check-status/ComplianceCheckStatusWidget.vue'),
    }),
    title: 'Compliance Check Status',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COMPLIANCE_CHECK_STATUS.DESC',
        preview_image: 'widget-img_complianceCheckStatus--thumbnail.png',
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
        ...getWidgetInheritOptionsForFilter(
            'project',
            'provider',
            'region',
            'asset_compliance_type',
            'asset_account',
        ),
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

export default complianceCheckStatusWidgetConfig;
