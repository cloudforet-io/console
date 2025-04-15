import { GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const totalFailFindingsHistoryWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailFindingsHistory',
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
        ['cloud_service_query_set', { fixed: true, hidden: true }],
        ['granularity', { fixed: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        ['filters.service_account', { fixed: true }],
        ['filters.region', { fixed: true }],
        'filters.provider',
    ]),
};

export default totalFailFindingsHistoryWidgetConfig;
