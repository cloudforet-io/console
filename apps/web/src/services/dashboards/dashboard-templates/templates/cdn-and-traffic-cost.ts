import type { DashboardTemplate } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/constants/dashboard-constants';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-templates/config';
import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-templates/helper';
import { COST_DATA_FIELD_MAP } from '@/services/dashboards/widgets/_configs/config';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['costTrend', {
        title: 'AWS Data-Transfer Cost Trend',
        widget_options: {
            cost_data_type: 'cost',
            cost_data_field: 'additional_info.Usage Type Details',
            filters: {
                // TODO: must be updated to string[] type
                cost_product: [{ k: 'product', v: ['AWSDataTransfer'], o: '=' }],
            },
        },
        schema_properties: [
            'cost_data_source',
            'cost_data_field',
            'cost_data_type',
            'filters.cost_product',
            'filters.project',
            'filters.service_account',
            'filters.project_group',
            'filters.region',
        ],
    }],
    ['costByRegionMultiFields', {
        title: 'AWS Data-Transfer by Region',
        widget_options: {
            cost_secondary_data_field: 'additional_info.Usage Type Details',
            filters: {
                // TODO: must be updated to string[] type
                cost_product: [{ k: 'product', v: ['AWSDataTransfer'], o: '=' }],
            },
        },
    }],
    ['costSummaryMultiFields', {
        title: 'AWS CloudFront Cost',
        widget_options: {
            cost_data_field: COST_DATA_FIELD_MAP.PROJECT.name,
            cost_secondary_data_field: 'additional_info.Usage Type Details',
            filters: {
                // TODO: must be updated to string[] type
                cost_product: [{ k: 'product', v: ['AmazonCloudFront'], o: '=' }],
            },
        },
    }],
];

export const cdnAndTrafficCostDashboardPreview: DefaultDashboardPreviewTemplate = {
    name: 'CDN & Traffic Cost',
    labels: [DASHBOARD_LABEL.COST],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_cdn-traffic-cost',
        preview_image: 'cdnAndTrafficCost',
    },
};

export const cdnAndTrafficCostDashboard: DashboardTemplate = {
    ...cdnAndTrafficCostDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.COST),
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
