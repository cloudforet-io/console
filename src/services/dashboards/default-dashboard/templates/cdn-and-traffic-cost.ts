import type { DashboardConfig } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/default-dashboard/config';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/default-dashboard/helper';

const widgetList = [
    'awsDataTransferCostTrend',
    'awsDataTransferByRegion',
    'awsCloudFrontCost',
];

export const cdnTrafficCostDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'CDN & Traffic Cost',
    labels: ['Cost'],
    version: '1',
    description: {
        preview_image: './assets/icons/ic_dashboard-template_cdn-traffic-cost.svg',
    },
};

export const cdnTrafficCostDashboard: DashboardConfig = {
    ...cdnTrafficCostDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        currency: {
            enabled: true,
        },
    },
    variables_schema: {
        properties: {},
        order: [],
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
