import { ASSET_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { DASHBOARD_LABELS } from '@/services/dashboards/constants/dashboard-labels';
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
    // ['trendOfPassAndFailFindings', {
    //     title: 'Trend of Pass and Fail Findings by Service',
    //     widget_options: {
    //         asset_data_field: ASSET_DATA_FIELD_MAP.SERVICE.name,
    //     },
    // }],
    // ['severityStatusByService'],
];

export const prowlerComplianceOverviewDashboard: DashboardTemplate = {
    name: 'Prowler Compliance Overview',
    template_id: 'prowlerComplianceOverview',
    template_type: 'EXTENSION',
    labels: [
        // DASHBOARD_LABELS.PROWLER,
        DASHBOARD_LABELS.SECURITY,
        // DASHBOARD_LABELS.CSPM
    ],
    version: '1',
    display_info: {
        icon: 'ic_prowler',
    },
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: {
        properties: {
            cloud_service_query_set: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.cloud_service_query_set,
                use: true,
                fixed: true,
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
            provider: {
                ...MANAGED_DASHBOARD_VARIABLES_SCHEMA.properties.provider,
                use: false,
            },
        },
        order: [
            'cloud_service_query_set',
            'project',
            'service_account',
            'region',
            'provider',
        ],
        fixed_options: {
            cloud_service_group: 'Prowler',
        },
    },
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList, { cloud_service_group: 'Prowler' }),
    ],
};
