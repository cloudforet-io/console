import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY, GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const trendOfPassAndFailFindingsWidgetConfig: WidgetConfig = {
    widget_config_id: 'trendOfPassAndFailFindings',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/trend-of-pass-and-fail-findings/TrendOfPassAndFailFindingsWidget.vue'),
    }),
    title: 'Trend of Pass and Fail Findings',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.TREND_OF_PASS_AND_FAIL_FINDINGS.DESC',
        preview_image: 'widget-img_trendOfPassAndFailFindings--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['lg', 'full'],
    options: {
        granularity: GRANULARITY.MONTHLY,
        asset_group_by: ASSET_GROUP_BY.SERVICE,
        pagination_options: {
            enabled: true,
            page_size: 5,
        },
    },
    options_schema: getWidgetOptionsSchema([
        'asset_query_set',
        'asset_group_by',
        'project',
        // 'service_account',
        'provider',
        'region',
        'asset_account',
    ]),
    // non_inheritable_properties: ['asset_group_by'],
};

export default trendOfPassAndFailFindingsWidgetConfig;
