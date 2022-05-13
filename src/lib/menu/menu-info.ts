/* eslint-disable import/no-cycle */
import { PROJECT_ROUTE } from '@/services/project/route-config';
import { MENU_ID, MenuId, MenuInfo } from '@/lib/menu/config';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.PROJECT]: {
        label: 'Project',
        translationId: '',
        icon: 'ic_project',
        to: { name: PROJECT_ROUTE._NAME },
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ASSET_INVENTORY]: {
        label: 'Asset Inventory',
        translationId: '',
        icon: 'ic_inventory',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        label: 'Cloud Service',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        label: 'Server',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        label: 'Collector',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        label: 'Service Account',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.COST_EXPLORER]: {
        label: 'Cost Explorer',
        translationId: '',
        icon: 'ic_analytics',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        label: 'Dashboard',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        label: 'Cost Analysis',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        label: 'Budget',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ALERT_MANAGER]: {
        label: 'Alert Manager',
        translationId: '',
        icon: 'ic_monitoring',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        label: 'Dashboard',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        label: 'Alert',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        label: 'Escalation Policy',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ADMINISTRATION]: {
        label: 'Administration',
        translationId: '',
        icon: 'ic_management',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ADMINISTRATION_IAM]: {
        label: 'IAM',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        label: 'User',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ADMINISTRATION_ROLE]: {
        label: 'Role',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.ADMINISTRATION_POLICY]: {
        label: 'Policy',
        translationId: '',
        accessLevel: 'VIEW_PERMISSION',
    },
    [MENU_ID.MY_PAGE]: {
        label: 'My Page',
        translationId: '',
        icon: 'ic_identity',
        accessLevel: 'AUTHENTICATED',
    },
    [MENU_ID.MY_PAGE_ACCOUNT]: {
        label: 'My Account',
        translationId: '',
        accessLevel: 'AUTHENTICATED',
    },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: {
        label: 'Account & Profile',
        translationId: '',
        accessLevel: 'AUTHENTICATED',
    },
    [MENU_ID.MY_PAGE_API_KEY]: {
        label: 'Access with API & CLI',
        translationId: '',
        accessLevel: 'AUTHENTICATED',
    },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: {
        label: 'Notifications Channel',
        translationId: '',
        isNew: true,
        accessLevel: 'AUTHENTICATED',
    },
});

export const getMenuLabel = (id: MenuId): string => MENU_INFO_MAP[id]?.label ?? '';
