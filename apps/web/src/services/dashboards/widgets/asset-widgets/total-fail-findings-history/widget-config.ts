import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import {
    getWidgetFilterOptionsSchema,
    getWidgetFilterSchemaPropertyNames, getWidgetInheritOptions, getWidgetInheritOptionsForFilter, getWidgetOptionsSchema,
} from '@/services/dashboards/widgets/_helpers/widget-schema-helper';


const totalFailFindingsHistoryWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailFindingsHistory',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/total-fail-findings-history/TotalFailFindingsHistoryWidget.vue'),
    }),
    title: 'Total Fail Findings History',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.TOTAL_FAIL_FINDINGS_HISTORY.DESC',
        preview_image: 'widget-img_totalFailFindingsHistory--thumbnail.png',
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

export default totalFailFindingsHistoryWidgetConfig;
