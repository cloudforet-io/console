// Menu Ids' Rule: All menu ids are dot-delimited in depth, up to two depths.
import type { TranslateResult } from 'vue-i18n';

import type { HighlightTagType } from '@/store/menu/type';


export const MENU_ID = Object.freeze({
    WORKSPACE_HOME: 'workspace_home',
    DASHBOARDS: 'dashboards',
    PROJECT: 'project',
    SERVICE_ACCOUNT: 'service_account',
    ASSET_INVENTORY: 'asset_inventory',
    CLOUD_SERVICE: 'cloud_service',
    SERVER: 'server',
    SECURITY: 'security',
    COLLECTOR: 'collector',
    COST_EXPLORER: 'cost_explorer',
    COST_ANALYSIS: 'cost_analysis',
    COST_ADVANCED_SETTINGS: 'cost_advanced_settings',
    BUDGET: 'budget',
    COST_REPORT: 'cost_report',
    DATA_SOURCES: 'data_sources',
    ALERT_MANAGER: 'alert_manager',
    ALERT_MANAGER_DASHBOARD: 'alert_manager_dashboard',
    ALERTS: 'alerts',
    ESCALATION_POLICY: 'escalation_policy',
    SERVICE: 'service',
    IAM: 'iam',
    USER: 'user',
    USER_GROUP: 'user_group',
    ROLE: 'role',
    APP: 'app',
    ADVANCED: 'advanced',
    PREFERENCES: 'preferences',
    DOMAIN_INFORMATION: 'domain_information',
    APPEARANCE: 'appearance',
    AUTO_DORMANCY_CONFIGURATION: 'auto_dormancy_configuration',
    ANOMALY_DETECTION_DOMAIN_CONFIGURATION: 'anomaly_detection_domain_configuration',
    CURRENCY_CONVERTER: 'currency_converter',
    WORKSPACES: 'workspaces',
    WORKSPACE_GROUP: 'workspace_group',
    BOOKMARK: 'bookmark',
    MY_PAGE: 'my_page',
    ACCOUNT_PROFILE: 'account_profile',
    NOTIFICATIONS: 'notifications',
    INFO: 'info',
    NOTICE: 'notice',
    METRIC_EXPLORER: 'metric_explorer',
    OPS_FLOW: 'ops_flow',
    OPS_FLOW_LANDING: 'ops_flow_landing',
    TASK_BOARD: 'task_board',
    TASK_MANAGEMENT: 'task_management',
} as const);

export type MenuId = typeof MENU_ID[keyof typeof MENU_ID];

export interface Menu {
    id: MenuId;
    label?: string|TranslateResult;
    needPermissionByRole?: boolean;
    subMenuList?: Menu[];
    hideOnGNB?: boolean;
    hideOnSiteMap?: boolean;
    order?: number;
}

export interface MenuInfo {
    menuId: MenuId;
    routeName: string;
    translationId: string;
    icon?: string;
    highlightTag?: HighlightTagType;
}
