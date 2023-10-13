// Menu Ids' Rule: All menu ids are dot-delimited in depth, up to two depths.
import type { HighlightTagType } from '@/store/modules/display/type';

export const MENU_ID = Object.freeze({
    HOME_DASHBOARD: 'home-dashboard',
    DASHBOARDS: 'dashboards',
    DASHBOARDS_PROJECT: 'dashboards.project',
    DASHBOARDS_WORKSPACE: 'dashboards.workspace',
    PROJECT: 'project',
    ASSET_INVENTORY: 'asset_inventory',
    ASSET_INVENTORY_CLOUD_SERVICE: 'asset_inventory.cloud_service',
    ASSET_INVENTORY_SERVER: 'asset_inventory.server',
    ASSET_INVENTORY_COLLECTOR: 'asset_inventory.collector',
    ASSET_INVENTORY_SERVICE_ACCOUNT: 'asset_inventory.service_account',
    COST_EXPLORER: 'cost_explorer',
    COST_EXPLORER_COST_ANALYSIS: 'cost_explorer.cost_analysis',
    COST_EXPLORER_BUDGET: 'cost_explorer.budget',
    ALERT_MANAGER: 'alert_manager',
    ALERT_MANAGER_DASHBOARD: 'alert_manager.dashboard',
    ALERT_MANAGER_ALERT: 'alert_manager.alert',
    ALERT_MANAGER_ESCALATION_POLICY: 'alert_manager.escalation_policy',
    ADMINISTRATION: 'administration',
    ADMINISTRATION_IAM: 'administration.iam',
    ADMINISTRATION_USER: 'administration.user',
    ADMINISTRATION_ROLE: 'administration.role',
    ADMINISTRATION_POLICY: 'administration.policy',
    // ADMINISTRATION_SETTINGS: 'administration.settings',
    // ADMINISTRATION_PROVIDER: 'administration.provider',
    MY_PAGE: 'my_page',
    MY_PAGE_ACCOUNT: 'my_page.account',
    MY_PAGE_ACCOUNT_PROFILE: 'my_page.account_profile',
    MY_PAGE_API_KEY: 'my_page.api_key',
    MY_PAGE_NOTIFICATIONS: 'my_page.notifications',
    INFO: 'info',
    INFO_NOTICE: 'info.notice',
} as const);

export type MenuId = typeof MENU_ID[keyof typeof MENU_ID];

export interface Menu {
    id: MenuId;
    subMenuList?: Menu[];
    hideOnGNB?: boolean;
    hideOnSiteMap?: boolean;
}

export interface MenuInfo {
    translationId: string;
    icon?: string;
    highlightTag?: HighlightTagType;
    needPermissionByRole?: boolean;
}
