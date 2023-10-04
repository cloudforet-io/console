import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptionsForFilter,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';

const totalFailFindingsStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailFindingsStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/total-fail-findings-status/TotalFailFindingsStatusWidget.vue'),
    }),
    title: 'Total Fail Findings Status',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_STATUS.DESC',
        preview_image: 'widget-img_totalFailFindingsStatus--thumbnail.png',
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
        default_properties: getWidgetFilterSchemaPropertyNames('provider', 'project', 'region', 'asset_compliance_framework', 'asset_account'),
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

export default totalFailFindingsStatusWidgetConfig;
