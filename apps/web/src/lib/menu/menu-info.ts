import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';
import { INFO_ROUTE } from '@/services/info/routes/route-constant';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';
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
    [MENU_ID.PROJECT_DASHBOARDS]: {
        menuId: MENU_ID.PROJECT_DASHBOARDS,
        routeName: DASHBOARDS_ROUTE.PROJECT._NAME,
        translationId: 'MENU.DASHBOARDS_PROJECT',
        icon: 'ic_service_dashboard',
    },
    [MENU_ID.WORKSPACE_DASHBOARDS]: {
        menuId: MENU_ID.WORKSPACE_DASHBOARDS,
        routeName: DASHBOARDS_ROUTE.WORKSPACE._NAME,
        translationId: 'MENU.DASHBOARDS_WORKSPACE',
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
    },
    [MENU_ID.COLLECTOR]: {
        menuId: MENU_ID.COLLECTOR,
        routeName: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
    },
    [MENU_ID.SERVICE_ACCOUNT]: {
        menuId: MENU_ID.SERVICE_ACCOUNT,
        routeName: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
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
    },
    [MENU_ID.BUDGET]: {
        menuId: MENU_ID.BUDGET,
        routeName: COST_EXPLORER_ROUTE.BUDGET._NAME,
        translationId: 'MENU.COST_EXPLORER_BUDGET',
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
    },
    [MENU_ID.ALERT]: {
        menuId: MENU_ID.ALERT,
        routeName: ALERT_MANAGER_ROUTE.ALERT._NAME,
        translationId: 'MENU.ALERT_MANAGER_ALERT',
    },
    [MENU_ID.ESCALATION_POLICY]: {
        menuId: MENU_ID.ESCALATION_POLICY,
        routeName: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
    },
    [MENU_ID.ADMINISTRATION]: {
        menuId: MENU_ID.ADMINISTRATION,
        routeName: ADMINISTRATION_ROUTE._NAME,
        translationId: 'MENU.ADMINISTRATION',
        icon: 'ic_service_administration',
    },
    [MENU_ID.IAM]: {
        menuId: MENU_ID.IAM,
        routeName: ADMINISTRATION_ROUTE.IAM._NAME,
        translationId: 'MENU.ADMINISTRATION_IAM',
    },
    [MENU_ID.USER]: {
        menuId: MENU_ID.USER,
        routeName: ADMINISTRATION_ROUTE.IAM.USER._NAME,
        translationId: 'MENU.ADMINISTRATION_USER',
    },
    [MENU_ID.ROLE]: {
        menuId: MENU_ID.ROLE,
        routeName: ADMINISTRATION_ROUTE.IAM.ROLE._NAME,
        translationId: 'MENU.ADMINISTRATION_ROLE',
    },
    [MENU_ID.POLICY]: {
        menuId: MENU_ID.POLICY,
        routeName: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
        translationId: 'MENU.ADMINISTRATION_POLICY',
    },
    [MENU_ID.PREFERENCE]: {
        menuId: MENU_ID.PREFERENCE,
        routeName: ADMINISTRATION_ROUTE.PREFERENCE._NAME,
        translationId: 'MENU.ADMINISTRATION_PRFERENCE',
    },
    [MENU_ID.DOMAIN_SETTINGS]: {
        menuId: MENU_ID.DOMAIN_SETTINGS,
        routeName: ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME,
        translationId: 'MENU.ADMINISTRATION_DOMAIN_SETTINGS',
    },
    [MENU_ID.WORKSPACES]: {
        menuId: MENU_ID.WORKSPACES,
        routeName: ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME,
        translationId: 'MENU.ADMINISTRATION_WORKSPACES',
    },
    [MENU_ID.MY_PAGE]: {
        menuId: MENU_ID.MY_PAGE,
        routeName: MY_PAGE_ROUTE._NAME,
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_service_my-page',
    },
    [MENU_ID.ACCOUNT]: {
        menuId: MENU_ID.ACCOUNT,
        routeName: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
        translationId: 'MENU.MY_PAGE_ACCOUNT',
    },
    [MENU_ID.ACCOUNT_PROFILE]: {
        menuId: MENU_ID.ACCOUNT_PROFILE,
        routeName: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT_PROFILE._NAME,
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
    },
    [MENU_ID.API_KEY]: {
        menuId: MENU_ID.API_KEY,
        routeName: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
        translationId: 'MENU.MY_PAGE_API_KEY',
    },
    [MENU_ID.NOTIFICATIONS]: {
        menuId: MENU_ID.NOTIFICATIONS,
        routeName: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
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
    },
});
