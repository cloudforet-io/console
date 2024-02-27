import { COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { getDashboardLayoutWidgetInfoList, getRefinedDashboardVariablesSchema } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


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
    ['budgetUsageByTarget'],
];


export const awsMonthlyCostSummaryDashboard: DashboardTemplate = {
    name: 'AWS Monthly Cost Summary',
    labels: ['AWS', 'Cost'],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_monthly-cost-summary',
    },
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        ...getRefinedDashboardVariablesSchema(['cost_data_source', 'project', 'service_account', 'region', 'cost_product'], ['provider']),
        fixed_options: {
            provider: 'aws',
        },
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
