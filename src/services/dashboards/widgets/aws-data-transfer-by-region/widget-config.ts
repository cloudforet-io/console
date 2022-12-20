import type { WidgetConfig } from '@/services/dashboards/widgets/config';
import { CHART_TYPE, GRANULARITY } from '@/services/dashboards/widgets/config';

const awsDataTransferByRegionWidgetConfig: WidgetConfig = {
    widget_config_id: 'awsDataTransferByRegion',
    widget_component: () => ({
        component: import('@/services/dashboards/widgets/aws-data-transfer-by-region/AWSDataTransferByRegion.vue'),
    }),
    title: 'AWS Data-Transfer By Region',
    labels: ['Cost'],
    description: {
        translation_id: 'DASHBOARDS.WIDGET.AWS_DATA_TRANSFER_BY_REGION.DESC',
        preview_image: 'widget-img_awsDataTransferByRegion--thumbnail.png',
    },
    scopes: ['PROJECT', 'WORKSPACE'],
    theme: {
        inherit: true,
    },
    sizes: ['lg', 'full'],
    widget_options: {
        granularity: GRANULARITY.ACCUMULATED,
        chart_type: CHART_TYPE.MAP,
        legend_options: {
            enabled: true,
            show_at: 'table',
        },
        selector_options: {
            enabled: true,
            type: 'cost-usage',
        },
    },
    widget_options_schema: {
        default_properties: ['filters.project_id', 'filters.service_account_id'],
        inheritable_properties: [
            'filters.project_id',
            'filters.service_account_id',
            'filters.user_id',
            'filters.cloud_service_type_id',
            'filters.region_code',
        ],
        schema: {
            type: 'object',
            properties: {
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

export default awsDataTransferByRegionWidgetConfig;
