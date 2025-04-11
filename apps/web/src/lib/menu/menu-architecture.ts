import type { Menu } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

export const DEFAULT_MENU_LIST: Menu[] = [
    {
        id: MENU_ID.WORKSPACE_HOME,
        needPermissionByRole: true,
        order: 0,
    },
    {
        id: MENU_ID.INFO,
        hideOnGNB: true,
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.NOTICE },
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
];

export const DEFAULT_ADMIN_MENU_LIST: Menu[] = [
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
        hideOnSiteMap: true,
        subMenuList: [
            { id: MENU_ID.NOTICE },
        ],
    },
];
