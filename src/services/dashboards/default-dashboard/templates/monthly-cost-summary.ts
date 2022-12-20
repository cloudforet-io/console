import type { DashboardConfig } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/default-dashboard/config';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/default-dashboard/helper';

const widgetList = [
    'monthlyCost',
    'budgetUsageSummary',
    'costMap',
    'costTrend',
    'costTrendStacked',
    'costDonut',
    'budgetStatus',
    'costByRegion',
];

export const monthlyCostSummaryDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'Monthly Cost Summary',
    labels: ['Cost'],
    version: '1',
    description: {
        preview_image: './images/icons/ic_dashboard-template_monthly-cost-summary.svg',
    },
};

export const monthlyCostSummaryDashboard: DashboardConfig = {
    ...monthlyCostSummaryDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        currency: {
            enabled: true,
        },
    },
    dashboard_variables_schema: {
        properties: {},
        order: [],
    },
    dashboard_variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
