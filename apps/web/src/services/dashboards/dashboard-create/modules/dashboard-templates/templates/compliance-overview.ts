import type { DashboardConfig } from '@/services/dashboards/config';
import { DASHBOARD_LABEL } from '@/services/dashboards/config';
import type { DefaultDashboardPreviewConfig } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/config';
import { getDashboardLayoutWidgetInfoList, getDashboardVariablesSchema } from '@/services/dashboards/dashboard-create/modules/dashboard-templates/helper';
import { ASSET_GROUP_BY } from '@/services/dashboards/widgets/_configs/config';

const widgetList: Parameters<typeof getDashboardLayoutWidgetInfoList>[0] = [
    ['complianceStatus'],
    ['totalFailFindingsStatus'],
    ['countOfPassAndFailFindings', {
        title: 'Count of Pass and Fail Findings by Region',
        widget_options: {
            asset_group_by: ASSET_GROUP_BY.REGION,
        },
    }],
    ['countOfFailFindings', {
        title: 'Count of Fail Findings by Service',
        widget_options: {
            asset_group_by: ASSET_GROUP_BY.SERVICE,
        },
    }],
    ['trendOfPassAndFailFindings', {
        title: 'Trend of Pass and Fail Findings by Service',
        widget_options: {
            asset_group_by: ASSET_GROUP_BY.SERVICE,
        },
    }],
    ['severityStatusByService'],
];

export const complianceOverviewDashboardPreview: DefaultDashboardPreviewConfig = {
    name: 'Compliance Overview',
    labels: [DASHBOARD_LABEL.ASSET, DASHBOARD_LABEL.COMPLIANCE, DASHBOARD_LABEL.SECURITY],
    version: '1',
    description: {
        icon: 'ic_dashboard-template_compliance',
        preview_image: 'complianceOverview',
    },
};

export const complianceOverviewDashboard: DashboardConfig = {
    ...complianceOverviewDashboardPreview,
    settings: {
        date_range: {
            enabled: true,
        },
        refresh_interval_option: '5m',
    },
    variables_schema: getDashboardVariablesSchema(DASHBOARD_LABEL.ASSET),
    variables: {},
    layouts: [
        getDashboardLayoutWidgetInfoList(widgetList),
    ],
};
