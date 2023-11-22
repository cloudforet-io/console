import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

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
    options_schema: getWidgetOptionsSchema([
        'cloud_service_query_set',
        'filters.project',
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default totalFailFindingsStatusWidgetConfig;
