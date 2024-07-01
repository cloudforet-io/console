import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { DASHBOARD_LABELS } from '@/services/dashboards/constants/dashboard-labels';
import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['monthlyCost', { title: 'Monthly Cost Overview', template_widget_id: 'template_monthly_cost_overview' }],
    ['budgetUsageSummary', { template_widget_id: 'template_budget_usage_summary' }],
    ['costMap', { title: 'Cost By Project', template_widget_id: 'template_cost_by_project' }],
    ['costTrend', {
        title: 'Cost Trend By Project',
        template_widget_id: 'template_cost_trend_by_project',
        widget_options: {
            cost_data_field: 'project',
        },
    }],
    ['costTrendStacked', {
        title: 'Cost Trend By Product',
        template_widget_id: 'template_cost_trend_by_product',
        widget_options: {
            cost_data_field: 'product',
        },
    }],
    ['costDonut', {
        title: 'Cost By Provider',
        template_widget_id: 'template_cost_by_provider',
        widget_options: {
            cost_data_field: 'provider',
        },
    }],
    ['budgetStatus', { template_widget_id: 'template_budget_status' }],
    ['costByRegion', { template_widget_id: 'template_cost_by_region' }],
    ['budgetUsageByTarget', { template_widget_id: 'template_budget_usage_by_targte' }],
];


export const awsMonthlyCostSummaryDashboard: DashboardTemplate = {
    name: 'AWS Monthly Cost Summary',
    template_id: 'awsMonthlyCostSummary',
    template_type: 'EXTENSION',
    labels: [DASHBOARD_LABELS.COST],
    version: '1',
    options: {
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
            project_group: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project_group,
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
        order: ['cost_data_source', 'project_group', 'project', 'service_account', 'region', 'cost_product', 'provider'],
        fixed_options: {
            provider: 'aws',
        },
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList, { provider: 'aws' }),
    ],
};
