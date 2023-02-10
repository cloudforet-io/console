import type { DashboardConfig } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/default-dashboard/config';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/default-dashboard/helper';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['monthlyCost', { title: 'Monthly Cost Overview' }],
    ['budgetUsageSummary'],
    ['costMap', { title: 'Cost By Project' }],
    ['costTrend', {
        title: 'Cost Trend By Project',
        widget_options: {
            group_by: 'project_id',
        },
    }],
    ['costTrendStacked', {
        title: 'Cost Trend By Product',
        widget_options: {
            group_by: 'product',
        },
    }],
    ['costDonut', { title: 'Cost By Provider' }],
    ['budgetStatus'],
    ['costByRegion'],
];

export const monthlyCostSummaryDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'Monthly Cost Summary',
    labels: ['Cost'],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_monthly-cost-summary',
        preview_image: 'monthlyCostSummary',
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
        refresh_interval_option: '5m',
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
