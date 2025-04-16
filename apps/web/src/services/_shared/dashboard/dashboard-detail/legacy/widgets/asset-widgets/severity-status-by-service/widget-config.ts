import type { WidgetConfig } from '@/api-clients/dashboard/_types/widget-type';

import { getWidgetOptionsSchema } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-options-schema-generator';

const severityStatusByServiceWidgetConfig: WidgetConfig = {
    widget_config_id: 'severityStatusByService',
    title: 'Severity Status by Service',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.SEVERITY_STATUS_BY_SERVICE.DESC',
        preview_image: 'widget-img_severityStatusByService--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['full'],
    options: {
        data_criteria: 'realtime',
    },
    options_schema: getWidgetOptionsSchema([
        ['cloud_service_query_set', { fixed: true }],
        'filters.project_group',
        'filters.project',
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default severityStatusByServiceWidgetConfig;
