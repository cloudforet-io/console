import { DASHBOARD_LABEL } from '@/schema/dashboard/_constants/dashboard-constant';
import { ASSET_DATA_FIELD_MAP } from '@/schema/dashboard/_constants/widget-constant';
import type { DashboardTemplate } from '@/schema/dashboard/_types/dashboard-type';

import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-template/helpers/dashboard-template-generator';
import type { DefaultDashboardPreviewTemplate } from '@/services/dashboards/dashboard-template/types/dashboard-template-type';

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

export const complianceOverviewDashboardPreview: DefaultDashboardPreviewTemplate = {
    name: 'Compliance Overview',
    labels: [DASHBOARD_LABEL.ASSET, DASHBOARD_LABEL.COMPLIANCE, DASHBOARD_LABEL.SECURITY],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_compliance',
        preview_image: 'complianceOverview',
    },
};

const getDashboardTemplate = (isAdminMode: boolean): DashboardTemplate => ({
    ...complianceOverviewDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.ASSET, isAdminMode),
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
});

export const complianceOverviewDashboard: DashboardTemplate = getDashboardTemplate(false);
export const adminComplianceOverviewDashboard: DashboardTemplate = getDashboardTemplate(true);
