import type { WidgetConfig } from '@/services/dashboards/widgets/_configs/config';
import { getWidgetOptionsSchema } from '@/services/dashboards/widgets/_configs/widget-options-schema';

const complianceStatusWidgetConfig: WidgetConfig = {
    widget_config_id: 'complianceStatus',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/asset-widgets/compliance-status/ComplianceStatusWidget.vue'),
    }),
    title: 'Compliance Status',
    labels: ['Asset'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.COMPLIANCE_STATUS.DESC',
        preview_image: 'widget-img_complianceStatus--thumbnail.png',
    },
    scopes: ['WORKSPACE'],
    theme: {
        inherit: false,
    },
    sizes: ['md'],
    options: {
        data_criteria: 'realtime',
    },
    options_schema: getWidgetOptionsSchema([
        'cloud_service_query_set',
        'filters.project',
        // 'filters.service_account', HACK: Re-enable it after backend is ready
        'filters.provider',
        'filters.region',
        'asset_account',
    ]),
};

export default complianceStatusWidgetConfig;
