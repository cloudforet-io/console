import { GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { DASHBOARD_LABELS } from '@/services/dashboards/constants/dashboard-labels';
import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['costTrend', {
        title: 'AWS Data-Transfer Cost Trend',
        template_widget_id: 'template_aws_data-transfer_cost_trend',
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
            'granularity',
            'cost_data_type',
            'filters.cost_product',
            'filters.project',
            'filters.service_account',
            'filters.region',
        ],
    }],
    ['costByRegionMultiFields', {
        title: 'AWS Data-Transfer by Region',
        template_widget_id: 'template_aws_data-transfer_by_region',
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
        template_widget_id: 'template_aws_cloud-front_cost',
        widget_options: {
            cost_data_field: 'project_id',
            granularity: GRANULARITY.YEARLY,
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
    template_id: 'awsCdnAndTraffic',
    template_type: 'EXTENSION',
    labels: [DASHBOARD_LABELS.CDN, DASHBOARD_LABELS.TRAFFIC, DASHBOARD_LABELS.COST],
    version: '1',
    display_info: {
        icon: 'ic_provider-aws',
    },
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        properties: {
            cost_data_source: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_data_source,
                fixed: true,
                use: true,
            },
            project: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project,
                use: true,
            },
            service_account: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.service_account,
                use: true,
            },
            region: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.region,
                use: true,
            },
            cost_product: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_product,
                use: true,
            },
            provider: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.provider,
                use: false,
            },
        },
        order: ['cost_data_source', 'project', 'service_account', 'region', 'cost_product', 'provider'],
        fixed_options: {
            provider: 'aws',
        },
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList, { provider: 'aws' }),
    ],
};
