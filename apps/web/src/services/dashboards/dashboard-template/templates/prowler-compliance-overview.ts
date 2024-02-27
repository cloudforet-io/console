import { ASSET_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { MANAGED_DASHBOARD_VARIABLES_SCHEMA } from '@/services/dashboards/constants/dashboard-managed-variables-schema';
import { getDashboardLayoutWidgetInfoList } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';


const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['complianceStatus'],
    ['totalFailFindingsStatus'],
    ['totalFailFindingsHistory'],
    ['countOfPassAndFailFindings', {
        title: 'Count of Pass and Fail Findings by Region',
        widget_options: {
            asset_data_field: ASSET_DATA_FIELD_MAP.REGION.name,
        },
    }],
    ['countOfFailFindings', {
        title: 'Count of Fail Findings by Service',
        widget_options: {
            asset_data_field: ASSET_DATA_FIELD_MAP.SERVICE.name,
        },
    }],
    ['trendOfPassAndFailFindings', {
        title: 'Trend of Pass and Fail Findings by Service',
        widget_options: {
            asset_data_field: ASSET_DATA_FIELD_MAP.SERVICE.name,
        },
    }],
    ['severityStatusByService'],
];

export const prowlerComplianceOverviewDashboard: DashboardTemplate = {
    name: 'Prowler Compliance Overview',
    labels: ['AWS', 'Azure', 'Google', 'Prowler', 'Security', 'CSPM'],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_compliance',
    },
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        properties: {
            cloud_service_query_set: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cloud_service_query_set,
            project: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.project,
            service_account: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.service_account,
            region: MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.region,
        },
        order: [
            'cloud_service_query_set',
            'project',
            'service_account',
            'region',
        ],
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
