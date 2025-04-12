import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const totalFailFindingsStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'totalFailFindingsStatus',
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
        ['cloud_service_query_set', { fixed: true, hidden: true }],
        ['filters.project_group', { fixed: true }],
        ['filters.project', { fixed: true }],
        ['filters.service_account', { fixed: true }],
        ['filters.region', { fixed: true }],
        'filters.provider',
    ]),
};

export default totalFailFindingsStatusWidgetConfig;
