import type { WidgetConfig } from '@/services/dashboards/widgets/config';

const dashboardCommonWidgetConfig: Partial<WidgetConfig> = {
    widget_config_id: 'dashboardCommon',
    widget_options_schema: {
        default_properties: ['filters.provider', 'filters.project_id', 'filters.service_account_id'],
        inheritable_properties: [
            'filters.provider',
            'filters.project_id',
            'filters.service_account_id',
            'filters.user_id',
            'filters.cloud_service_type_id',
            'filters.region_code',
        ],
        schema: {
            type: 'object',
            properties: {
                'filters.provider': {
                    title: 'Provider',
                    type: 'array',
                },
                'filters.project_id': {
                    title: 'Project',
                    type: 'array',
                },
                'filters.service_account_id': {
                    title: 'Service Account',
                    type: 'array',
                },
                'filters.user_id': {
                    title: 'User',
                    type: 'array',
                },
                'filters.cloud_service_type_id': {
                    title: 'Cloud Service Type',
                    type: 'array',
                },
                'filters.region_code': {
                    title: 'Region',
                    type: 'array',
                },
            },
        },
    },
};

export default dashboardCommonWidgetConfig;
