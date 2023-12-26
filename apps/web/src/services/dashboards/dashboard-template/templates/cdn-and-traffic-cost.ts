import { DASHBOARD_LABEL } from '@/schema/dashboard/_constants/dashboard-constant';
import { COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-template/types/dashboard-template-type';

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
                // TODO: must be updated to string[] type
                cost_product: [{ k: 'product', v: ['AmazonCloudFront'], o: '=' }],
            },
        },
        inherit_options: {
            'filters.cost_product': { enabled: false },
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

const getDashboardTemplate = (isAdminMode: boolean): DashboardTemplate => ({
    ...cdnAndTrafficCostDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.COST, isAdminMode),
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
});
export const cdnAndTrafficCostDashboard: DashboardTemplate = getDashboardTemplate(false);
export const adminCdnAndTrafficCostDashboard: DashboardTemplate = getDashboardTemplate(true);
