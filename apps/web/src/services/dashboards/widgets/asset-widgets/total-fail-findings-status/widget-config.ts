import type { WidgetConfig } from '@/schema/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_helpers/widget-options-schema-generator';

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
        'cloud_service_query_set',
        'filters.project_group',
        'filters.project',
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default totalFailFindingsStatusWidgetConfig;
