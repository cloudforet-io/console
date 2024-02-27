import { COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['costTrend', {
        title: 'AWS Data-Transfer Cost Trend',
        widget_options: {
            cost_data_type: 'cost',
            cost_data_field: 'additional_info.Usage Type Details',
            filters: {
                cost_product: [{ k: 'product', v: ['AWSDataTransfer'], o: '=' }],
            },
        },
        inherit_options: {
            'filters.cost_product': { enabled: false },
        },
        schema_properties: [
            'cost_data_source',
            'cost_data_field',
            'cost_data_type',
            'filters.cost_product',
            'filters.project',
            'filters.service_account',
            'filters.region',
        ],
    }],
    ['costByRegionMultiFields', {
        title: 'AWS Data-Transfer by Region',
        widget_options: {
            cost_secondary_data_field: 'additional_info.Usage Type Details',
            filters: {
                cost_product: [{ k: 'product', v: ['AWSDataTransfer'], o: '=' }],
            },
        },
        inherit_options: {
            'filters.cost_product': { enabled: false },
        },
    }],
    ['costSummaryMultiFields', {
        title: 'AWS CloudFront Cost',
        widget_options: {
            cost_data_field: COST_DATA_FIELD_MAP.PROJECT.name,
            cost_secondary_data_field: 'additional_info.Usage Type Details',
            filters: {
                cost_product: [{ k: 'product', v: ['AmazonCloudFront'], o: '=' }],
            },
        },
        inherit_options: {
            'filters.cost_product': { enabled: false },
        },
    }],
];

export const awsCdnAndTrafficDashboard: DashboardTemplate = {
    name: 'AWS CDN & Traffic',
    labels: ['AWS', 'CDN', 'Traffic', 'Cost'],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_cdn-traffic-cost',
    },
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        properties: {
            cost_data_source: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_data_source,
            project: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project,
            service_account: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.service_account,
            region: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.region,
            cost_product: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_product,
        },
        order: [
            'cost_data_source',
            'project',
            'service_account',
            'region',
            'cost_product',
        ],
    },
    variables: {
        provider: 'AWS',
    },
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
