import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const MENU_LIST: Menu[] = [
    {
        id: MENU_ID.WORKSPACE_HOME,
        needPermissionByRole: true,
    },
    {
        id: MENU_ID.DASHBOARDS,
        needPermissionByRole: true,
    },
    { id: MENU_ID.PROJECT, needPermissionByRole: true },
    {
        id: MENU_ID.ASSET_INVENTORY,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.CLOUD_SERVICE, needPermissionByRole: true },
            { id: MENU_ID.SERVER, needPermissionByRole: true },
            { id: MENU_ID.SECURITY, needPermissionByRole: true },
            { id: MENU_ID.METRIC_EXPLORER, needPermissionByRole: true },
            { id: MENU_ID.COLLECTOR, needPermissionByRole: true },
            { id: MENU_ID.SERVICE_ACCOUNT, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS, needPermissionByRole: true },
            { id: MENU_ID.BUDGET, needPermissionByRole: true },
            { id: MENU_ID.COST_REPORT, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.ALERT_MANAGER,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.ALERT_MANAGER_DASHBOARD, needPermissionByRole: true },
            { id: MENU_ID.ALERTS, needPermissionByRole: true },
            { id: MENU_ID.ESCALATION_POLICY, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.OPS_FLOW,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.OPS_FLOW_LANDING },
            { id: MENU_ID.TASK_BOARD },
        ],
    },
    {

        id: MENU_ID.IAM,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.USER, needPermissionByRole: true },
            { id: MENU_ID.APP, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.MY_PAGE,
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.ACCOUNT_PROFILE },
            { id: MENU_ID.NOTIFICATIONS },
        ],
    },
    {
        id: MENU_ID.INFO,
        hideOnGNB: true,
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.NOTICE },
        ],
    },
];


export const MENU_LIST_FOR_ALERT_MANAGER_V2: Menu[] = [
    {
        id: MENU_ID.WORKSPACE_HOME,
        needPermissionByRole: true,
    },
    {
        id: MENU_ID.DASHBOARDS,
        needPermissionByRole: true,
    },
    { id: MENU_ID.PROJECT, needPermissionByRole: true },
    {
        id: MENU_ID.ASSET_INVENTORY,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.CLOUD_SERVICE, needPermissionByRole: true },
            { id: MENU_ID.SERVER, needPermissionByRole: true },
            { id: MENU_ID.SECURITY, needPermissionByRole: true },
            { id: MENU_ID.METRIC_EXPLORER, needPermissionByRole: true },
            { id: MENU_ID.COLLECTOR, needPermissionByRole: true },
            { id: MENU_ID.SERVICE_ACCOUNT, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS, needPermissionByRole: true },
            { id: MENU_ID.BUDGET, needPermissionByRole: true },
            { id: MENU_ID.COST_REPORT, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.ALERT_MANAGER,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.SERVICE, needPermissionByRole: true },
            { id: MENU_ID.ALERTS, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.OPS_FLOW,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.OPS_FLOW_LANDING },
            { id: MENU_ID.TASK_BOARD },
        ],
    },
    {
        id: MENU_ID.IAM,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.USER, needPermissionByRole: true },
            { id: MENU_ID.USER_GROUP, needPermissionByRole: true },
            { id: MENU_ID.APP, needPermissionByRole: true },
        ],
    },
    {
        id: MENU_ID.MY_PAGE,
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.ACCOUNT_PROFILE },
            { id: MENU_ID.NOTIFICATIONS },
        ],
    },
    {
        id: MENU_ID.INFO,
        hideOnGNB: true,
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.NOTICE },
        ],
    },
];

export const ADMIN_MENU_LIST: Menu[] = [
    {
        id: MENU_ID.DASHBOARDS,
    },
    {
        id: MENU_ID.ASSET_INVENTORY,
        subMenuList: [
            { id: MENU_ID.CLOUD_SERVICE },
            { id: MENU_ID.SERVER },
            { id: MENU_ID.SECURITY },
            { id: MENU_ID.METRIC_EXPLORER },
            { id: MENU_ID.COLLECTOR },
            { id: MENU_ID.SERVICE_ACCOUNT },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS },
            { id: MENU_ID.BUDGET },
            { id: MENU_ID.COST_REPORT },
            { id: MENU_ID.DATA_SOURCES },
            { id: MENU_ID.COST_ADVANCED_SETTINGS },
        ],
    },
    {
        id: MENU_ID.OPS_FLOW,
        subMenuList: [
            { id: MENU_ID.TASK_MANAGEMENT },
        ],
    },
    {
        id: MENU_ID.IAM,
        subMenuList: [
            { id: MENU_ID.USER },
            { id: MENU_ID.USER_GROUP },
            { id: MENU_ID.APP },
            { id: MENU_ID.ROLE },
        ],
    },
    {
        id: MENU_ID.ADVANCED,
        subMenuList: [
            { id: MENU_ID.WORKSPACES },
            { id: MENU_ID.WORKSPACE_GROUP },
            { id: MENU_ID.BOOKMARK },
            { id: MENU_ID.AUTO_DORMANCY_CONFIGURATION },
            { id: MENU_ID.PREFERENCES },
        ],
    },
    {
        id: MENU_ID.INFO,
        subMenuList: [
            { id: MENU_ID.NOTICE },
        ],
    },
];

export const ADMIN_MENU_LIST_FOR_ALERT_MANAGER_V2: Menu[] = [
    {
        id: MENU_ID.DASHBOARDS,
    },
    {
        id: MENU_ID.ASSET_INVENTORY,
        subMenuList: [
            { id: MENU_ID.CLOUD_SERVICE },
            { id: MENU_ID.SERVER },
            { id: MENU_ID.SECURITY },
            { id: MENU_ID.METRIC_EXPLORER },
            { id: MENU_ID.COLLECTOR },
            { id: MENU_ID.SERVICE_ACCOUNT },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS },
            { id: MENU_ID.BUDGET },
            { id: MENU_ID.COST_REPORT },
            { id: MENU_ID.DATA_SOURCES },
            { id: MENU_ID.COST_ADVANCED_SETTINGS },
        ],
    },
    {
        id: MENU_ID.OPS_FLOW,
        subMenuList: [
            { id: MENU_ID.TASK_MANAGEMENT },
        ],
    },
    {
        id: MENU_ID.IAM,
        subMenuList: [
            { id: MENU_ID.USER },
            { id: MENU_ID.APP },
            { id: MENU_ID.ROLE },
        ],
    },
    {
        id: MENU_ID.ADVANCED,
        subMenuList: [
            { id: MENU_ID.WORKSPACES },
            { id: MENU_ID.WORKSPACE_GROUP },
            { id: MENU_ID.BOOKMARK },
            { id: MENU_ID.AUTO_DORMANCY_CONFIGURATION },
            { id: MENU_ID.PREFERENCES },
        ],
    },
    {
        id: MENU_ID.INFO,
        subMenuList: [
            { id: MENU_ID.NOTICE },
        ],
    },
];
