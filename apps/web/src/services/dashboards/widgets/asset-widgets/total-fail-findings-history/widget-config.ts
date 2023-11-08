import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { GRANULARITY } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

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
    options_schema: getWidgetOptionsSchema([
        'cloud_service_query_set',
        ['granularity', { fixed: true }],
        'filters.project',
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default totalFailFindingsHistoryWidgetConfig;
