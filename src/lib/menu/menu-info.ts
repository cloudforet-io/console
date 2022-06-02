import { ACCESS_LEVEL } from '@/lib/access-control/config';
import { MENU_ID, MenuId, MenuInfo } from '@/lib/menu/config';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.PROJECT]: {
        translationId: 'MENU.PROJECT',
        icon: 'ic_project',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ASSET_INVENTORY]: {
        translationId: 'MENU.ASSET_INVENTORY',
        icon: 'ic_inventory',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        translationId: 'MENU.ASSET_INVENTORY_CLOUD_SERVICE',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        translationId: 'MENU.ASSET_INVENTORY_SERVER',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        translationId: 'MENU.ASSET_INVENTORY_COLLECTOR',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        translationId: 'MENU.ASSET_INVENTORY_SERVICE_ACCOUNT',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.COST_EXPLORER]: {
        translationId: 'MENU.COST_EXPLORER',
        icon: 'ic_analytics',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        translationId: 'MENU.COST_EXPLORER_DASHBOARD',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        translationId: 'MENU.COST_EXPLORER_COST_ANALYSIS',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        translationId: 'MENU.COST_EXPLORER_BUDGET',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ALERT_MANAGER]: {
        translationId: 'MENU.ALERT_MANAGER',
        icon: 'ic_monitoring',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        translationId: 'MENU.ALERT_MANAGER_DASHBOARD',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        translationId: 'MENU.ALERT_MANAGER_ALERT',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        translationId: 'MENU.ALERT_MANAGER_ESCALATION_POLICY',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ADMINISTRATION]: {
        translationId: 'MENU.ADMINISTRATION',
        icon: 'ic_management',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ADMINISTRATION_IAM]: {
        translationId: 'MENU.ADMINISTRATION_IAM',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        translationId: 'MENU.ADMINISTRATION_USER',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ADMINISTRATION_ROLE]: {
        translationId: 'MENU.ADMINISTRATION_ROLE',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.ADMINISTRATION_POLICY]: {
        translationId: 'MENU.ADMINISTRATION_POLICY',
        accessLevel: ACCESS_LEVEL.VIEW_PERMISSION,
    },
    [MENU_ID.MY_PAGE]: {
        translationId: 'MENU.MY_PAGE',
        icon: 'ic_identity',
        accessLevel: ACCESS_LEVEL.AUTHENTICATED,
    },
    [MENU_ID.MY_PAGE_ACCOUNT]: {
        translationId: 'MENU.MY_PAGE_ACCOUNT',
        accessLevel: ACCESS_LEVEL.AUTHENTICATED,
    },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: {
        translationId: 'MENU.MY_PAGE_ACCOUNT_PROFILE',
        accessLevel: ACCESS_LEVEL.AUTHENTICATED,
    },
    [MENU_ID.MY_PAGE_API_KEY]: {
        translationId: 'MENU.MY_PAGE_API_KEY',
        accessLevel: ACCESS_LEVEL.AUTHENTICATED,
    },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: {
        translationId: 'MENU.MY_PAGE_NOTIFICATIONS',
        isNew: true,
        accessLevel: ACCESS_LEVEL.AUTHENTICATED,
    },
});
