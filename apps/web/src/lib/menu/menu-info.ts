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
        name: DASHBOARDS_ROUTE._NAME,
        translationId: 'MENU.DASHBOARDS',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
        highlightTag: 'new',
    },
    [MENU_ID.PROJECT_DASHBOARDS]: {
        menuId: MENU_ID.PROJECT_DASHBOARDS,
        name: DASHBOARDS_ROUTE.PROJECT._NAME,
        translationId: 'MENU.DASHBOARDS_PROJECT',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
    },
    [MENU_ID.WORKSPACE_DASHBOARDS]: {
        menuId: MENU_ID.WORKSPACE_DASHBOARDS,
        name: DASHBOARDS_ROUTE.WORKSPACE._NAME,
        translationId: 'MENU.DASHBOARDS_WORKSPACE',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
    },
    [MENU_ID.PROJECT]: {
        menuId: MENU_ID.PROJECT,
        name: PROJECT_ROUTE._NAME,
        translationId: 'MENU.PROJECT',
        icon: 'ic_service_project',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY]: {
        menuId: MENU_ID.ASSET_INVENTORY,
        name: ASSET_INVENTORY_ROUTE._NAME,
        translationId: 'MENU.ASSET_INVENTORY',
        icon: 'ic_service_asset-inventory',
        needPermissionByRole: true,
    },
    [MENU_ID.CLOUD_SERVICE]: {
        menuId: MENU_ID.CLOUD_SERVICE,
        name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
        translationId: 'MENU.ASSET_INVENTORY_CLOUD_SERVICE',
        needPermissionByRole: true,
    },
    [MENU_ID.COLLECTOR]: {
        menuId: MENU_ID.COLLECTOR,
        name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME,
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        needPermissionByRole: true,
    },
    [MENU_ID.SERVICE_ACCOUNT]: {
        menuId: MENU_ID.SERVICE_ACCOUNT,
        name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME,
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER]: {
        menuId: MENU_ID.COST_EXPLORER,
        name: COST_EXPLORER_ROUTE._NAME,
        translationId: 'MENU.COST_EXPLORER',
        icon: 'ic_service_cost-explorer',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_ANALYSIS]: {
        menuId: MENU_ID.COST_ANALYSIS,
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        translationId: 'MENU.COST_EXPLORER_COST_ANALYSIS',
        needPermissionByRole: true,
    },
    [MENU_ID.BUDGET]: {
        menuId: MENU_ID.BUDGET,
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        translationId: 'MENU.COST_EXPLORER_BUDGET',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER]: {
        menuId: MENU_ID.ALERT_MANAGER,
        name: ALERT_MANAGER_ROUTE._NAME,
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_service_alert-manager',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
        name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME,
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT]: {
        menuId: MENU_ID.ALERT,
        name: ALERT_MANAGER_ROUTE.ALERT._NAME,
        translationId: 'MENU.ALERT_MANAGER_ALERT',
        needPermissionByRole: true,
    },
    [MENU_ID.ESCALATION_POLICY]: {
        menuId: MENU_ID.ESCALATION_POLICY,
        name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME,
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION]: {
        menuId: MENU_ID.ADMINISTRATION,
        name: ADMINISTRATION_ROUTE._NAME,
        translationId: 'MENU.ADMINISTRATION',
        icon: 'ic_service_administration',
        needPermissionByRole: true,
    },
    [MENU_ID.IAM]: {
        menuId: MENU_ID.IAM,
        name: ADMINISTRATION_ROUTE.IAM._NAME,
        translationId: 'MENU.ADMINISTRATION_IAM',
        needPermissionByRole: true,
    },
    [MENU_ID.USER]: {
        menuId: MENU_ID.USER,
        name: ADMINISTRATION_ROUTE.IAM.USER._NAME,
        translationId: 'MENU.ADMINISTRATION_USER',
        needPermissionByRole: true,
    },
    [MENU_ID.ROLE]: {
        menuId: MENU_ID.ROLE,
        name: ADMINISTRATION_ROUTE.IAM.ROLE._NAME,
        translationId: 'MENU.ADMINISTRATION_ROLE',
        needPermissionByRole: true,
    },
    [MENU_ID.POLICY]: {
        menuId: MENU_ID.POLICY,
        name: ADMINISTRATION_ROUTE.IAM.POLICY._NAME,
        translationId: 'MENU.ADMINISTRATION_POLICY',
        needPermissionByRole: true,
    },
    [MENU_ID.PREFERENCE]: {
        menuId: MENU_ID.PREFERENCE,
        name: ADMINISTRATION_ROUTE.PREFERENCE._NAME,
        translationId: 'MENU.ADMINISTRATION_PRFERENCE',
        needPermissionByRole: true,
    },
    [MENU_ID.DOMAIN_SETTINGS]: {
        menuId: MENU_ID.DOMAIN_SETTINGS,
        name: ADMINISTRATION_ROUTE.PREFERENCE.DOMAIN_SETTINGS._NAME,
        translationId: 'MENU.ADMINISTRATION_DOMAIN_SETTINGS',
        needPermissionByRole: true,
    },
    [MENU_ID.WORKSPACES]: {
        menuId: MENU_ID.WORKSPACES,
        name: ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME,
        translationId: 'MENU.ADMINISTRATION_WORKSPACES',
        needPermissionByRole: true,
    },
    [MENU_ID.MY_PAGE]: {
        menuId: MENU_ID.MY_PAGE,
        name: MY_PAGE_ROUTE._NAME,
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_service_my-page',
    },
    [MENU_ID.ACCOUNT]: {
        menuId: MENU_ID.ACCOUNT,
        name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME,
        translationId: 'MENU.MY_PAGE_ACCOUNT',
    },
    [MENU_ID.ACCOUNT_PROFILE]: {
        menuId: MENU_ID.ACCOUNT_PROFILE,
        name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT_PROFILE._NAME,
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
    },
    [MENU_ID.API_KEY]: {
        menuId: MENU_ID.API_KEY,
        name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME,
        translationId: 'MENU.MY_PAGE_API_KEY',
    },
    [MENU_ID.NOTIFICATIONS]: {
        menuId: MENU_ID.NOTIFICATIONS,
        name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME,
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
    },
    [MENU_ID.INFO]: {
        menuId: MENU_ID.INFO,
        name: INFO_ROUTE._NAME,
        translationId: 'MENU.INFO',
        icon: 'ic_service_info',
    },
    [MENU_ID.NOTICE]: {
        menuId: MENU_ID.NOTICE,
        name: INFO_ROUTE.NOTICE._NAME,
        translationId: 'MENU.INFO_NOTICE',
    },
});
