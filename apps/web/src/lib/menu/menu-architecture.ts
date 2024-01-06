import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const MENU_LIST: Menu[] = [
    {
        id: MENU_ID.HOME_DASHBOARD,
        needPermissionByRole: true,
        hideOnGNB: true,
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
        ],
    },
    {
        id: MENU_ID.ALERT_MANAGER,
        needPermissionByRole: true,
        subMenuList: [
            { id: MENU_ID.ALERT_MANAGER_DASHBOARD, needPermissionByRole: true },
            { id: MENU_ID.ALERT, needPermissionByRole: true },
            { id: MENU_ID.ESCALATION_POLICY, needPermissionByRole: true },
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
        hideOnGNB: true,
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
    // HACK: hide for now
    // {
    //     id: MENU_ID.HOME_DASHBOARD,
    //     hideOnGNB: true,
    // },
    // {
    //     id: MENU_ID.DASHBOARDS,
    // },
    // TODO: low priority features, so hide it for now
    // {
    //     id: MENU_ID.ASSET_INVENTORY,
    //     subMenuList: [
    //         { id: MENU_ID.CLOUD_SERVICE },
    //         { id: MENU_ID.SERVER, needPermissionByRole: true },
    //         { id: MENU_ID.COLLECTOR },
    //     ],
    // },
    {
        id: MENU_ID.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_ANALYSIS },
            { id: MENU_ID.BUDGET },
        ],
    },
    {
        id: MENU_ID.ADMINISTRATION,
        subMenuList: [
            {
                id: MENU_ID.IAM,
                subMenuList: [
                    { id: MENU_ID.USER },
                    { id: MENU_ID.APP },
                    { id: MENU_ID.ROLE },
                ],
            },
            {
                id: MENU_ID.PREFERENCE,
                subMenuList: [
                    { id: MENU_ID.WORKSPACES },
                    { id: MENU_ID.DOMAIN_SETTINGS },
                ],
            },
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
