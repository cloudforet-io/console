import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/route-config';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';
import { MENU_ID, MenuId, MenuInfo } from '@/lib/menu/config';

export const MENU_INFO_MAP: Record<MenuId, MenuInfo> = Object.freeze({
    [MENU_ID.PROJECT]: {
        label: 'Project', translationId: '', icon: 'ic_project', to: { name: PROJECT_ROUTE._NAME },
    },
    [MENU_ID.ASSET_INVENTORY]: {
        label: 'Asset Inventory',
        translationId: '',
        icon: 'ic_inventory',
        to: { name: ASSET_INVENTORY_ROUTE._NAME },
    },
    [MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE]: {
        label: 'Cloud Service',
        translationId: '',
        to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
    },
    [MENU_ID.ASSET_INVENTORY_SERVER]: {
        label: 'Server',
        translationId: '',
        to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
    },
    [MENU_ID.ASSET_INVENTORY_COLLECTOR]: {
        label: 'Collector',
        translationId: '',
        to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
    },
    [MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT]: {
        label: 'Service Account',
        translationId: '',
        to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
    },
    [MENU_ID.COST_EXPLORER]: {
        label: 'Cost Explorer',
        translationId: '',
        icon: 'ic_analytics',
        to: { name: COST_EXPLORER_ROUTE._NAME },
    },
    [MENU_ID.COST_EXPLORER_DASHBOARD]: {
        label: 'Dashboard',
        translationId: '',
        to: { name: COST_EXPLORER_ROUTE.DASHBOARD._NAME },
    },
    [MENU_ID.COST_EXPLORER_COST_ANALYSIS]: {
        label: 'Cost Analysis',
        translationId: '',
        to: { name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME },
    },
    [MENU_ID.COST_EXPLORER_BUDGET]: {
        label: 'Budget',
        translationId: '',
        to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME },
    },
    [MENU_ID.ALERT_MANAGER]: {
        label: 'Alert Manager',
        translationId: '',
        icon: 'ic_monitoring',
        to: { name: ALERT_MANAGER_ROUTE._NAME },
    },
    [MENU_ID.ALERT_MANAGER_DASHBOARD]: {
        label: 'Dashboard',
        translationId: '',
        to: { name: ALERT_MANAGER_ROUTE.DASHBOARD._NAME },
    },
    [MENU_ID.ALERT_MANAGER_ALERT]: {
        label: 'Alert',
        translationId: '',
        to: { name: ALERT_MANAGER_ROUTE.ALERT._NAME },
    },
    [MENU_ID.ALERT_MANAGER_ESCALATION_POLICY]: {
        label: 'Escalation Policy',
        translationId: '',
        to: { name: ALERT_MANAGER_ROUTE.ESCALATION_POLICY._NAME },
    },
    [MENU_ID.ADMINISTRATION]: {
        label: 'Administration',
        translationId: '',
        icon: 'ic_management',
        to: { name: ADMINISTRATION_ROUTE._NAME },
    },
    [MENU_ID.ADMINISTRATION_IAM]: {
        label: 'IAM',
        translationId: '',
        to: { name: ADMINISTRATION_ROUTE.IAM._NAME },
    },
    [MENU_ID.ADMINISTRATION_USER]: {
        label: 'User',
        translationId: '',
        to: { name: ADMINISTRATION_ROUTE.IAM.USER._NAME },
    },
    [MENU_ID.MY_PAGE]: {
        label: 'My Page',
        translationId: '',
        icon: 'ic_identity',
        to: { name: MY_PAGE_ROUTE._NAME },
    },
    [MENU_ID.MY_PAGE_ACCOUNT]: {
        label: 'My Account',
        translationId: '',
        to: { name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME },
    },
    [MENU_ID.MY_PAGE_ACCOUNT_PROFILE]: {
        label: 'Account & Profile',
        translationId: '',
        to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.ACCOUNT._NAME },
    },
    [MENU_ID.MY_PAGE_API_KEY]: {
        label: 'Access with API & CLI',
        translationId: '',
        to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.API_KEY._NAME },
    },
    [MENU_ID.MY_PAGE_NOTIFICATIONS]: {
        label: 'Notifications Channel',
        translationId: '',
        isNew: true,
        to: { name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION._NAME },
    },
});
