import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const severityStatusByServiceWidgetConfig: WidgetConfig = {
    widget_config_id: 'severityStatusByService',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/severity-status-by-service/SeverityStatusByServiceWidget.vue'),
    }),
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
        'cloud_service_query_set',
        'filters.project',
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        'filters.provider',
        'filters.region',
        'filters.asset_account',
    ]),
};

export default severityStatusByServiceWidgetConfig;
