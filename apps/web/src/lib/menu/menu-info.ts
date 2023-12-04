import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.HOME_DASHBOARD]: {
        menuId: MENU_ID.HOME_DASHBOARD,
        translationId: 'MENU.HOME_DASHBOARD',
        icon: 'ic_service_home',
    },
    [MENU_ID.DASHBOARDS]: {
        menuId: MENU_ID.DASHBOARDS,
        translationId: 'MENU.DASHBOARDS',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
        highlightTag: 'new',
    },
    [MENU_ID.PROJECT_DASHBOARDS]: {
        menuId: MENU_ID.PROJECT_DASHBOARDS,
        translationId: 'MENU.DASHBOARDS_PROJECT',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
    },
    [MENU_ID.WORKSPACE_DASHBOARDS]: {
        menuId: MENU_ID.WORKSPACE_DASHBOARDS,
        translationId: 'MENU.DASHBOARDS_WORKSPACE',
        icon: 'ic_service_dashboard',
        needPermissionByRole: true,
    },
    [MENU_ID.PROJECT]: {
        menuId: MENU_ID.PROJECT,
        translationId: 'MENU.PROJECT',
        icon: 'ic_service_project',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY]: {
        menuId: MENU_ID.ASSET_INVENTORY,
        translationId: 'MENU.ASSET_INVENTORY',
        icon: 'ic_service_asset-inventory',
        needPermissionByRole: true,
    },
    [MENU_ID.CLOUD_SERVICE]: {
        menuId: MENU_ID.CLOUD_SERVICE,
        translationId: 'MENU.ASSET_INVENTORY_CLOUD_SERVICE',
        needPermissionByRole: true,
    },
    [MENU_ID.COLLECTOR]: {
        menuId: MENU_ID.COLLECTOR,
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        needPermissionByRole: true,
    },
    [MENU_ID.SERVICE_ACCOUNT]: {
        menuId: MENU_ID.SERVICE_ACCOUNT,
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER]: {
        menuId: MENU_ID.COST_EXPLORER,
        translationId: 'MENU.COST_EXPLORER',
        icon: 'ic_service_cost-explorer',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_ANALYSIS]: {
        menuId: MENU_ID.COST_ANALYSIS,
        translationId: 'MENU.COST_EXPLORER_COST_ANALYSIS',
        needPermissionByRole: true,
    },
    [MENU_ID.BUDGET]: {
        menuId: MENU_ID.BUDGET,
        translationId: 'MENU.COST_EXPLORER_BUDGET',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER]: {
        menuId: MENU_ID.ALERT_MANAGER,
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_service_alert-manager',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        menuId: MENU_ID.ALERT_MANAGER_DASHBOARD,
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT]: {
        menuId: MENU_ID.ALERT,
        translationId: 'MENU.ALERT_MANAGER_ALERT',
        needPermissionByRole: true,
    },
    [MENU_ID.ESCALATION_POLICY]: {
        menuId: MENU_ID.ESCALATION_POLICY,
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION]: {
        menuId: MENU_ID.ADMINISTRATION,
        translationId: 'MENU.ADMINISTRATION',
        icon: 'ic_service_administration',
        needPermissionByRole: true,
    },
    [MENU_ID.IAM]: {
        menuId: MENU_ID.IAM,
        translationId: 'MENU.ADMINISTRATION_IAM',
        needPermissionByRole: true,
    },
    [MENU_ID.USER]: {
        menuId: MENU_ID.USER,
        translationId: 'MENU.ADMINISTRATION_USER',
        needPermissionByRole: true,
    },
    [MENU_ID.ROLE]: {
        menuId: MENU_ID.ROLE,
        translationId: 'MENU.ADMINISTRATION_ROLE',
        needPermissionByRole: true,
    },
    [MENU_ID.POLICY]: {
        menuId: MENU_ID.POLICY,
        translationId: 'MENU.ADMINISTRATION_POLICY',
        needPermissionByRole: true,
    },
    [MENU_ID.PREFERENCE]: {
        menuId: MENU_ID.PREFERENCE,
        translationId: 'MENU.ADMINISTRATION_PREFRENCE',
        needPermissionByRole: true,
    },
    [MENU_ID.DOMAIN_SETTINGS]: {
        menuId: MENU_ID.DOMAIN_SETTINGS,
        translationId: 'MENU.ADMINISTRATION_DOMAIN_SETTINGS',
        needPermissionByRole: true,
    },
    [MENU_ID.WORKSPACES]: {
        menuId: MENU_ID.WORKSPACES,
        translationId: 'MENU.ADMINISTRATION_WORKSPACES',
        needPermissionByRole: true,
    },
    [MENU_ID.MY_PAGE]: {
        menuId: MENU_ID.MY_PAGE,
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_service_my-page',
    },
    [MENU_ID.ACCOUNT]: {
        menuId: MENU_ID.ACCOUNT,
        translationId: 'MENU.MY_PAGE_ACCOUNT',
    },
    [MENU_ID.ACCOUNT_PROFILE]: {
        menuId: MENU_ID.ACCOUNT_PROFILE,
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
    },
    [MENU_ID.API_KEY]: {
        menuId: MENU_ID.API_KEY,
        translationId: 'MENU.MY_PAGE_API_KEY',
    },
    [MENU_ID.NOTIFICATIONS]: {
        menuId: MENU_ID.NOTIFICATIONS,
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
    },
    [MENU_ID.INFO]: {
        menuId: MENU_ID.INFO,
        translationId: 'MENU.INFO',
        icon: 'ic_service_info',
    },
    [MENU_ID.NOTICE]: {
        menuId: MENU_ID.NOTICE,
        translationId: 'MENU.INFO_NOTICE',
    },
});
