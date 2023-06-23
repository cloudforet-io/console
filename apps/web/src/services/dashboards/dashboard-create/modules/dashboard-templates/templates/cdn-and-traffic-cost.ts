import type { DashboardConfig } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/config';
import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['awsDataTransferCostTrend'],
    ['awsDataTransferByRegion'],
    ['awsCloudFrontCost', { title: 'AWS CloudFront Cost by Project' }],
];

export const cdnAndTrafficCostDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'CDN & Traffic Cost',
    labels: [DASHBOARD_LABEL.COST],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_cdn-traffic-cost',
        preview_image: 'cdnAndTrafficCost',
    },
};

export const cdnAndTrafficCostDashboard: DashboardConfig = {
    ...cdnAndTrafficCostDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        currency: {
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
