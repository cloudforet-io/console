import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const MENU_LIST: Menu[] = [
    { id: MENU_ID.PROJECT },
    {
        id: MENU_ID.ASSET_INVENTORY,
        subMenuList: [
            { id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE },
            { id: MENU_ID.ASSET_INVENTORY_SERVER },
            { id: MENU_ID.ASSET_INVENTORY_COLLECTOR },
            { id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT },
        ],
    },
    {
        id: MENU_ID.COST_EXPLORER,
        subMenuList: [
            { id: MENU_ID.COST_EXPLORER_DASHBOARD },
            { id: MENU_ID.COST_EXPLORER_COST_ANALYSIS },
            { id: MENU_ID.COST_EXPLORER_BUDGET },
        ],
    },
    {
        id: MENU_ID.ALERT_MANAGER,
        subMenuList: [
            { id: MENU_ID.ALERT_MANAGER_DASHBOARD },
            { id: MENU_ID.ALERT_MANAGER_ALERT },
            { id: MENU_ID.ALERT_MANAGER_ESCALATION_POLICY },
        ],
    },
    {
        id: MENU_ID.ADMINISTRATION,
        subMenuList: [
            {
                id: MENU_ID.ADMINISTRATION_IAM,
                subMenuList: [
                    { id: MENU_ID.ADMINISTRATION_USER },
                    { id: MENU_ID.ADMINISTRATION_ROLE },
                    { id: MENU_ID.ADMINISTRATION_POLICY },
                ],
            },
        ],
    },
    {
        id: MENU_ID.MY_PAGE,
        optional: true,
        subMenuList: [
            {
                id: MENU_ID.MY_PAGE_ACCOUNT,
                subMenuList: [
                    { id: MENU_ID.MY_PAGE_ACCOUNT_PROFILE },
                    { id: MENU_ID.MY_PAGE_API_KEY },
                    { id: MENU_ID.MY_PAGE_NOTIFICATIONS },
                ],
            },

        ],
    },
];
