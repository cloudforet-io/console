import type { MenuId, MenuInfo } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.HOME_DASHBOARD]: {
        translationId: 'MENU.HOME_DASHBOARD',
        icon: 'ic_dashboard',
    },
    [MENU_ID.DASHBOARDS]: {
        translationId: 'MENU.DASHBOARDS',
        icon: 'ic_dashboard',
        needPermissionByRole: true,
    },
    [MENU_ID.PROJECT]: {
        translationId: 'MENU.PROJECT',
        icon: 'ic_project',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY]: {
        translationId: 'MENU.ASSET_INVENTORY',
        icon: 'ic_inventory',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        translationId: 'MENU.ASSET_INVENTORY_CLOUD_SERVICE',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        translationId: 'MENU.ASSET_INVENTORY_SERVER',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        needPermissionByRole: true,
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER]: {
        translationId: 'MENU.COST_EXPLORER',
        icon: 'ic_analytics',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        translationId: 'MENU.COST_EXPLORER_DASHBOARD',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        translationId: 'MENU.COST_EXPLORER_COST_ANALYSIS',
        needPermissionByRole: true,
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        translationId: 'MENU.COST_EXPLORER_BUDGET',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER]: {
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_monitoring',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        translationId: 'MENU.ALERT_MANAGER_ALERT',
        needPermissionByRole: true,
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION]: {
        translationId: 'MENU.ADMINISTRATION',
        icon: 'ic_management',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION_IAM]: {
        translationId: 'MENU.ADMINISTRATION_IAM',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        translationId: 'MENU.ADMINISTRATION_USER',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION_ROLE]: {
        translationId: 'MENU.ADMINISTRATION_ROLE',
        needPermissionByRole: true,
    },
    [MENU_ID.ADMINISTRATION_POLICY]: {
        translationId: 'MENU.ADMINISTRATION_POLICY',
        needPermissionByRole: true,
    },
    // [MENU_ID.ADMINISTRATION_SETTINGS]: {
    //     translationId: 'MENU.ADDITIONAL_SETTINGS',
    //     needPermissionByRole: true,
    // },
    // [MENU_ID.ADMINISTRATION_PROVIDER]: {
    //     translationId: 'MENU.PROVIDER',
    //     needPermissionByRole: true,
    // },
    [MENU_ID.MY_PAGE]: {
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_identity',
    },
    [MENU_ID.MY_PAGE_ACCOUNT]: {
        translationId: 'MENU.MY_PAGE_ACCOUNT',
    },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: {
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
    },
    [MENU_ID.MY_PAGE_API_KEY]: {
        translationId: 'MENU.MY_PAGE_API_KEY',
    },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: {
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
    },
    [MENU_ID.INFO]: {
        translationId: 'MENU.INFO',
        isNew: true,
        icon: 'ic_info-menu',
    },
    [MENU_ID.INFO_NOTICE]: {
        translationId: 'MENU.INFO_NOTICE',
        isNew: true,
    },
});
