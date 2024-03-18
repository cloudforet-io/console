import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { IAM_ROUTE } from '@/services/iam/routes/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
import { PREFERENCE_ROUTE } from '@/services/preference/routes/route-constant';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.HOME_DASHBOARD]: {
        menuId: MENU_ID.HOME_DASHBOARD,
        routeName: HOME_DASHBOARD_ROUTE._NAME,
        translationId: 'MENU.HOME_DASHBOARD',
        icon: 'ic_service_home',
    },
    [MENU_ID.DASHBOARDS]: {
        menuId: MENU_ID.DASHBOARDS,
        routeName: DASHBOARDS_ROUTE._NAME,
        translationId: 'MENU.DASHBOARDS',
        icon: 'ic_service_dashboard',
    },
    [MENU_ID.PROJECT]: {
        menuId: MENU_ID.PROJECT,
        routeName: PROJECT_ROUTE._NAME,
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
    [MENU_ID.COLLECTOR]: {
        menuId: MENU_ID.COLLECTOR,
        routeName: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        icon: 'ic_service_collector',
    },
    [MENU_ID.SERVICE_ACCOUNT]: {
        menuId: MENU_ID.SERVICE_ACCOUNT,
        routeName: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
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
        icon: 'ic_service_cost-anlaysis',
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
        highlightTag: 'new',
        icon: 'ic_service_cost-report',
    },
    [MENU_ID.ALERT_MANAGER]: {
        menuId: MENU_ID.ALERT_MANAGER,
        routeName: ALERT_MANAGER_ROUTE._NAME,
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_service_alert-manager',
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
        routeName: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        icon: 'ic_service_alert-dashboard',
    },
    [MENU_ID.ALERT]: {
        menuId: MENU_ID.ALERT,
        routeName: ALERT_MANAGER_ROUTE.ALERT._NAME,
        translationId: 'MENU.ALERT_MANAGER_ALERT',
        icon: 'ic_service_alert',
    },
    [MENU_ID.ESCALATION_POLICY]: {
        menuId: MENU_ID.ESCALATION_POLICY,
        routeName: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        icon: 'ic_service_escalation-policy',
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
    [MENU_ID.ROLE]: {
        menuId: MENU_ID.ROLE,
        routeName: IAM_ROUTE.ROLE._NAME,
        translationId: 'MENU.ADMINISTRATION_ROLE',
        icon: 'ic_service_role',
    },
    [MENU_ID.APP]: {
        menuId: MENU_ID.APP,
        routeName: IAM_ROUTE.APP._NAME,
        translationId: 'MENU.ADMINISTRATION_APP',
        icon: 'ic_service_app',
    },
    [MENU_ID.PREFERENCE]: {
        menuId: MENU_ID.PREFERENCE,
        routeName: PREFERENCE_ROUTE._NAME,
        translationId: 'MENU.ADMINISTRATION_PREFERENCE',
    },
    [MENU_ID.DOMAIN_SETTINGS]: {
        menuId: MENU_ID.DOMAIN_SETTINGS,
        routeName: PREFERENCE_ROUTE.DOMAIN_SETTINGS._NAME,
        translationId: 'MENU.ADMINISTRATION_DOMAIN_SETTINGS',
        icon: 'ic_service_domain-settings',
    },
    [MENU_ID.WORKSPACES]: {
        menuId: MENU_ID.WORKSPACES,
        routeName: PREFERENCE_ROUTE.WORKSPACES._NAME,
        translationId: 'MENU.ADMINISTRATION_WORKSPACES',
        icon: 'ic_service_workspaces',
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
    [MENU_ID.METRIC_EXPLORER]: {
        menuId: MENU_ID.METRIC_EXPLORER,
        routeName: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER._NAME,
        translationId: 'MENU.ASSET_INVENTORY_METRIC_EXPLORER',
        icon: 'ic_service_metric-explorer',
    },
});
