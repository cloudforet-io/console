import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions, getWidgetInheritOptionsForFilter, getWidgetOptionsSchema,
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
    sizes: ['sm', 'full'],
    options: {
        data_criteria: 'realtime',
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
        default_properties: ['asset_query_set', ...getWidgetFilterSchemaPropertyNames('provider', 'project', 'region', 'asset_account')],
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

export default totalFailFindingsStatusWidgetConfig;
