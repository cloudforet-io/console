// Menu Ids' Rule: All menu ids are dot-delimited in depth, up to two depths.
import type { HighlightTagType } from '@/store/modules/display/type';

export const MENU_ID = Object.freeze({
    WORKSPACE_HOME: 'workspace-home',
    DASHBOARDS: 'dashboards',
    PROJECT: 'project',
    ASSET_INVENTORY: 'asset_inventory',
    CLOUD_SERVICE: 'cloud_service',
    SERVER: 'server',
    SECURITY: 'security',
    COLLECTOR: 'collector',
    SERVICE_ACCOUNT: 'service_account',
    COST_EXPLORER: 'cost_explorer',
    COST_ANALYSIS: 'cost_analysis',
    BUDGET: 'budget',
    COST_REPORT: 'cost_report',
    DATA_SOURCES: 'data_sources',
    ALERT_MANAGER: 'alert_manager',
    ALERT_MANAGER_DASHBOARD: 'alert_manager_dashboard',
    ALERT: 'alert',
    ESCALATION_POLICY: 'escalation_policy',
    IAM: 'iam',
    USER: 'user',
    ROLE: 'role',
    APP: 'app',
    PREFERENCE: 'preference',
    DOMAIN_SETTINGS: 'domain_settings',
    WORKSPACES: 'workspaces',
    BOOKMARK: 'bookmark',
    MY_PAGE: 'my_page',
    ACCOUNT_PROFILE: 'account_profile',
    NOTIFICATIONS: 'notifications',
    INFO: 'info',
    NOTICE: 'notice',
    ASSET_ANALYSIS: 'asset_analysis',
} as const);

export type MenuId = typeof MENU_ID[keyof typeof MENU_ID];

export interface Menu {
    id: MenuId;
    needPermissionByRole?: boolean;
    subMenuList?: Menu[];
    hideOnGNB?: boolean;
    hideOnSiteMap?: boolean;
}

export interface MenuInfo {
    menuId: MenuId;
    routeName: string;
    translationId: string;
    icon?: string;
    highlightTag?: HighlightTagType;
}
