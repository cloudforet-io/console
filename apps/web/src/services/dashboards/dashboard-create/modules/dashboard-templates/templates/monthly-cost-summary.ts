import type { DashboardConfig } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/config';
import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import { COST_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['monthlyCost', { title: 'Monthly Cost Overview' }],
    ['budgetUsageSummary'],
    ['costMap', { title: 'Cost By Project' }],
    ['costTrend', {
        title: 'Cost Trend By Project',
        widget_options: {
            cost_group_by: COST_GROUP_BY.PROJECT,
        },
    }],
    ['costTrendStacked', {
        title: 'Cost Trend By Product',
        widget_options: {
            cost_group_by: COST_GROUP_BY.PRODUCT,
        },
    }],
    ['costDonut', { title: 'Cost By Provider' }],
    ['budgetStatus'],
    ['costByRegion'],
];

export const monthlyCostSummaryDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'Monthly Cost Summary',
    labels: [DASHBOARD_LABEL.COST],
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
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.COST),
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
