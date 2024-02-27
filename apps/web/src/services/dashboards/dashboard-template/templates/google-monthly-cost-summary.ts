import { COST_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


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

export const googleMonthlyCostSummaryDashboard: DashboardTemplate = {
    name: 'Google Monthly Cost Summary',
    labels: ['Google', 'Cost'],
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
        properties: {
            cost_data_source: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_data_source,
            project: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project,
            service_account: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.service_account,
            region: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.region,
            cost_product: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_product,
        },
        order: [
            'cost_data_source',
            'project',
            'service_account',
            'region',
            'cost_product',
        ],
    },
    variables: {
        provider: 'google_cloud',
    },
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
