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

export const azureMonthlyCostSummaryDashboard: DashboardTemplate = {
    name: 'Azure Monthly Cost Summary',
    labels: ['Azure', 'Cost'],
    version: '1',
    display_info: {
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
            cost_data_source: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cost_data_source,
                fixed: true,
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
        order: ['cost_data_source', 'project', 'service_account', 'region', 'cost_product', 'provider'],
        fixed_options: {
            provider: 'azure',
        },
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList, { provider: 'azure' }),
    ],
};
