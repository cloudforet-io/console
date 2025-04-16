import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { ALERT_MANAGER_ROUTE_V1 } from '@/services/alert-manager/v1/routes/route-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
import { ADMIN_OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/admin/route-constant';
import { OPS_FLOW_ROUTE } from '@/services/ops-flow/routes/route-constant';
import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';
import { SERVICE_ACCOUNT_ROUTE } from '@/services/service-account/routes/route-constant';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.WORKSPACE_HOME]: {
        menuId: MENU_ID.WORKSPACE_HOME,
        routeName: WORKSPACE_HOME_ROUTE._NAME,
        translationId: 'MENU.WORKSPACE_HOME',
        icon: 'ic_service_home',
    },
    [MENU_ID.DASHBOARDS]: {
        menuId: MENU_ID.DASHBOARDS,
        routeName: DASHBOARDS_ROUTE._NAME,
        translationId: 'MENU.DASHBOARDS',
        highlightTag: 'update',
        icon: 'ic_service_dashboard',
    },
    [MENU_ID.PROJECT]: {
        menuId: MENU_ID.PROJECT,
        routeName: PROJECT_ROUTE_V2._NAME,
        translationId: 'MENU.PROJECT',
        icon: 'ic_service_project',
    },
    [MENU_ID.ASSET_INVENTORY]: {
        menuId: MENU_ID.ASSET_INVENTORY,
        routeName: ASSET_INVENTORY_ROUTE._NAME,
        translationId: 'MENU.ASSET_INVENTORY',
        icon: 'ic_service_asset-inventory',
    },
    [MENU_ID.CLOUD_SERVICE]: {
        menuId: MENU_ID.CLOUD_SERVICE,
        routeName: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        translationId: 'MENU.ASSET_INVENTORY_CLOUD_SERVICE',
        icon: 'ic_service_cloud-service',
    },
    [MENU_ID.SERVER]: {
        menuId: MENU_ID.SERVER,
        routeName: ASSET_INVENTORY_ROUTE.SERVER._NAME,
        translationId: 'MENU.ASSET_INVENTORY_SERVER',
        icon: 'ic_service_server',
    },
    [MENU_ID.SECURITY]: {
        menuId: MENU_ID.SECURITY,
        routeName: ASSET_INVENTORY_ROUTE.SECURITY._NAME,
        translationId: 'MENU.ASSET_INVENTORY_SECURITY',
        icon: 'ic_service_security',
    },
    [MENU_ID.METRIC_EXPLORER]: {
        menuId: MENU_ID.METRIC_EXPLORER,
        routeName: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME,
        translationId: 'MENU.ASSET_INVENTORY_METRIC_EXPLORER',
        icon: 'ic_service_metric-explorer',
    },
    [MENU_ID.COLLECTOR]: {
        menuId: MENU_ID.COLLECTOR,
        routeName: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        icon: 'ic_service_collector',
    },
    [MENU_ID.SERVICE_ACCOUNT]: {
        menuId: MENU_ID.SERVICE_ACCOUNT,
        routeName: SERVICE_ACCOUNT_ROUTE._NAME,
        translationId: 'MENU.SERVICE_ACCOUNT',
        icon: 'ic_service_service-account',
    },
    [MENU_ID.COST_EXPLORER]: {
        menuId: MENU_ID.COST_EXPLORER,
        routeName: COST_EXPLORER_ROUTE._NAME,
        translationId: 'MENU.COST_EXPLORER',
        icon: 'ic_service_cost-explorer',
    },
    [MENU_ID.COST_ANALYSIS]: {
        menuId: MENU_ID.COST_ANALYSIS,
        routeName: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        translationId: 'MENU.COST_EXPLORER_COST_ANALYSIS',
        icon: 'ic_service_cost-analysis',
    },
    [MENU_ID.BUDGET]: {
        menuId: MENU_ID.BUDGET,
        routeName: COST_EXPLORER_ROUTE.BUDGET._NAME,
        translationId: 'MENU.COST_EXPLORER_BUDGET',
        icon: 'ic_service_budget',
    },
    [MENU_ID.COST_REPORT]: {
        menuId: MENU_ID.COST_REPORT,
        routeName: COST_EXPLORER_ROUTE.COST_REPORT._NAME,
        translationId: 'MENU.COST_EXPLORER_REPORT',
        icon: 'ic_service_cost-report',
    },
    [MENU_ID.DATA_SOURCES]: {
        menuId: MENU_ID.DATA_SOURCES,
        routeName: ADMIN_COST_EXPLORER_ROUTE.DATA_SOURCES._NAME,
        translationId: 'MENU.COST_EXPLORER_DATA_SOURCES',
        icon: 'ic_service_data-sources',
    },
    [MENU_ID.COST_ADVANCED_SETTINGS]: {
        menuId: MENU_ID.COST_ADVANCED_SETTINGS,
        routeName: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS._NAME,
        translationId: 'COST_EXPLORER.COST_ADVANCED_SETTINGS',
        highlightTag: 'new',
        icon: 'ic_service_advanced-settings',
    },
    [MENU_ID.ANOMALY_DETECTION_DOMAIN_CONFIGURATION]: {
        menuId: MENU_ID.ANOMALY_DETECTION_DOMAIN_CONFIGURATION,
        routeName: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.ANOMALY_DETECTION_DOMAIN_CONFIGURATION._NAME,
        translationId: 'COST_EXPLORER.ANOMALY_DETECTION_CONFIGURATION',
    },
    [MENU_ID.CURRENCY_CONVERTER]: {
        menuId: MENU_ID.CURRENCY_CONVERTER,
        routeName: ADMIN_COST_EXPLORER_ROUTE.COST_ADVANCED_SETTINGS.CURRENCY_CONVERTER._NAME,
        translationId: 'COST_EXPLORER.CURRENCY_CONVERTER',
        highlightTag: 'new',
    },
    // NOTE: v1 menu
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
        routeName: ALERT_MANAGER_ROUTE_V1.DASHBOARD._NAME,
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        icon: 'ic_service_alert-dashboard',
    },
    // NOTE: v1 menu
    [MENU_ID.ESCALATION_POLICY]: {
        menuId: MENU_ID.ESCALATION_POLICY,
        routeName: ALERT_MANAGER_ROUTE_V1.ESCALATION_POLICY._NAME,
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        icon: 'ic_service_escalation-policy',
    },
    [MENU_ID.ALERT_MANAGER]: {
        menuId: MENU_ID.ALERT_MANAGER,
        routeName: ALERT_MANAGER_ROUTE._NAME,
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_service_alert',
    },
    [MENU_ID.SERVICE]: {
        menuId: MENU_ID.SERVICE,
        routeName: ALERT_MANAGER_ROUTE.SERVICE._NAME,
        translationId: 'MENU.ALERT_MANAGER_SERVICE',
        icon: 'ic_service_alert-dashboard',
    },
    [MENU_ID.ALERTS]: {
        menuId: MENU_ID.ALERTS,
        routeName: ALERT_MANAGER_ROUTE.ALERTS._NAME,
        translationId: 'MENU.ALERT_MANAGER_ALERTS',
        icon: 'ic_service_alert',
    },
    [MENU_ID.IAM]: {
        menuId: MENU_ID.IAM,
        routeName: IAM_ROUTE._NAME,
        translationId: 'MENU.ADMINISTRATION_IAM',
        icon: 'ic_service_user',
    },
    [MENU_ID.USER]: {
        menuId: MENU_ID.USER,
        routeName: IAM_ROUTE.USER._NAME,
        translationId: 'MENU.ADMINISTRATION_USER',
        icon: 'ic_service_user',
    },
    [MENU_ID.USER_GROUP]: {
        menuId: MENU_ID.USER_GROUP,
        routeName: IAM_ROUTE.USER_GROUP._NAME,
        translationId: 'MENU.ADMINISTRATION_USER_GROUP',
        icon: 'ic_member',
    },
    [MENU_ID.ROLE]: {
        menuId: MENU_ID.ROLE,
        routeName: ADMIN_IAM_ROUTE.ROLE._NAME,
        translationId: 'MENU.ADMINISTRATION_ROLE',
        icon: 'ic_service_role',
    },
    [MENU_ID.APP]: {
        menuId: MENU_ID.APP,
        routeName: IAM_ROUTE.APP._NAME,
        translationId: 'MENU.ADMINISTRATION_APP',
        icon: 'ic_service_app',
    },
    [MENU_ID.ADVANCED]: {
        menuId: MENU_ID.ADVANCED,
        routeName: ADMIN_ADVANCED_ROUTE._NAME,
        translationId: 'MENU.ADMINISTRATION_ADVANCED',
    },
    [MENU_ID.PREFERENCES]: {
        menuId: MENU_ID.PREFERENCES,
        routeName: ADMIN_ADVANCED_ROUTE.PREFERENCES._NAME,
        translationId: 'MENU.ADMINISTRATION_PREFERENCES',
        icon: 'ic_service_domain-settings',
    },
    [MENU_ID.DOMAIN_INFORMATION]: {
        menuId: MENU_ID.DOMAIN_INFORMATION,
        routeName: ADMIN_ADVANCED_ROUTE.PREFERENCES.DOMAIN_INFORMATION._NAME,
        translationId: 'IAM.DOMAIN_SETTINGS.DOMAIN_INFORMATION',
    },

    [MENU_ID.APPEARANCE]: {
        menuId: MENU_ID.APPEARANCE,
        routeName: ADMIN_ADVANCED_ROUTE.PREFERENCES.APPEARANCE._NAME,
        translationId: 'IAM.DOMAIN_SETTINGS.APPEARANCE',
    },

    [MENU_ID.AUTO_DORMANCY_CONFIGURATION]: {
        menuId: MENU_ID.AUTO_DORMANCY_CONFIGURATION,
        routeName: ADMIN_ADVANCED_ROUTE.AUTO_DORMANCY_CONFIGURATION._NAME,
        translationId: 'IAM.AUTO_DORMANCY_CONFIGURATION',
        icon: 'ic_service_dormancy-configuration',
    },
    [MENU_ID.WORKSPACES]: {
        menuId: MENU_ID.WORKSPACES,
        routeName: ADMIN_ADVANCED_ROUTE.WORKSPACES._NAME,
        translationId: 'MENU.ADMINISTRATION_WORKSPACES',
        icon: 'ic_service_workspaces',
    },
    [MENU_ID.WORKSPACE_GROUP]: {
        menuId: MENU_ID.WORKSPACE_GROUP,
        routeName: ADMIN_ADVANCED_ROUTE.WORKSPACE_GROUP._NAME,
        translationId: 'MENU.ADMINISTRATION_WORKSPACE_GROUP',
        icon: 'ic_workspaces',
        highlightTag: 'new',
    },
    [MENU_ID.BOOKMARK]: {
        menuId: MENU_ID.BOOKMARK,
        routeName: ADMIN_ADVANCED_ROUTE.BOOKMARK._NAME,
        translationId: 'MENU.ADMINISTRATION_BOOKMARK',
        icon: 'ic_service_bookmark',
    },
    [MENU_ID.MY_PAGE]: {
        menuId: MENU_ID.MY_PAGE,
        routeName: MY_PAGE_ROUTE._NAME,
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_service_my-page',
    },
    [MENU_ID.ACCOUNT_PROFILE]: {
        menuId: MENU_ID.ACCOUNT_PROFILE,
        routeName: MY_PAGE_ROUTE.ACCOUNT_PROFILE._NAME,
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
        icon: 'ic_my-page_account-and-profile',
    },
    [MENU_ID.NOTIFICATIONS]: {
        menuId: MENU_ID.NOTIFICATIONS,
        routeName: MY_PAGE_ROUTE.NOTIFICATION._NAME,
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
        highlightTag: 'beta',
        icon: 'ic_my-page_notifications-channel',
    },
    [MENU_ID.INFO]: {
        menuId: MENU_ID.INFO,
        routeName: INFO_ROUTE._NAME,
        translationId: 'MENU.INFO',
        icon: 'ic_service_info',
    },
    [MENU_ID.NOTICE]: {
        menuId: MENU_ID.NOTICE,
        routeName: INFO_ROUTE.NOTICE._NAME,
        translationId: 'MENU.INFO_NOTICE',
        icon: 'ic_gnb_bell',
    },
    [MENU_ID.OPS_FLOW]: {
        menuId: MENU_ID.OPS_FLOW,
        routeName: OPS_FLOW_ROUTE._NAME,
        translationId: 'MENU.OPS_FLOW',
        icon: 'ic_service_board',
    },
    [MENU_ID.OPS_FLOW_LANDING]: {
        menuId: MENU_ID.OPS_FLOW_LANDING,
        routeName: OPS_FLOW_ROUTE.LANDING._NAME,
        translationId: 'OpsFlow Landing', // It will be replaced by task management template
        icon: 'ic_service_service-desk',
    },
    [MENU_ID.TASK_BOARD]: {
        menuId: MENU_ID.TASK_BOARD,
        routeName: OPS_FLOW_ROUTE.BOARD._NAME,
        translationId: 'Board', // It will be replaced by task management template
        icon: 'ic_service_board',
    },
    [MENU_ID.TASK_MANAGEMENT]: {
        menuId: MENU_ID.TASK_MANAGEMENT,
        routeName: ADMIN_OPS_FLOW_ROUTE.TASK_MANAGEMENT._NAME,
        translationId: 'MENU.TASK_MANAGEMENT',
        icon: 'ic_service_task-management',
    },
});
