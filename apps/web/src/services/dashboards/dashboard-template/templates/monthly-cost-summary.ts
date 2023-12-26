import { DASHBOARD_LABEL } from '@/schema/dashboard/_constants/dashboard-constant';
import { COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-template/types/dashboard-template-type';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['monthlyCost', { title: 'Monthly Cost Overview' }],
    ['budgetUsageSummary'],
    ['costMap', { title: 'Cost By Project' }],
    ['costTrend', {
        title: 'Cost Trend By Project',
        widget_options: {
            cost_data_field: COST_DATA_FIELD_MAP.PROJECT.name,
        },
    }],
    ['costTrendStacked', {
        title: 'Cost Trend By Product',
        widget_options: {
            cost_data_field: COST_DATA_FIELD_MAP.PRODUCT.name,
        },
    }],
    ['costDonut', { title: 'Cost By Provider' }],
    ['budgetStatus'],
    ['costByRegion'],
];

export const monthlyCostSummaryDashboardPreview: DefaultDashboardPreviewTemplate = {
    name: 'Monthly Cost Summary',
    labels: [DASHBOARD_LABEL.COST],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_monthly-cost-summary',
        preview_image: 'monthlyCostSummary',
    },
};

const getDashboardTemplate = (isAdminMode: boolean): DashboardTemplate => ({
    ...monthlyCostSummaryDashboardPreview,
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

export const monthlyCostSummaryDashboard: DashboardTemplate = getDashboardTemplate(false);
export const adminMonthlyCostSummaryDashboard: DashboardTemplate = getDashboardTemplate(true);
