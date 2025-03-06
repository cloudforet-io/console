import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_ADVANCED_ROUTE = {
    _NAME: `admin.${MENU_ID.ADVANCED}`,
    WORKSPACES: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.WORKSPACES}` },
    WORKSPACE_GROUP: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.WORKSPACE_GROUP}` },
    PREFERENCES: {
        _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}`,
        DOMAIN_INFORMATION: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}.domain_information` },
        APPEARANCE: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}.appearance` },
    },
    BOOKMARK: {
        _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}`,
        DETAIL: {
            _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail`,
            GROUP: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail.group` },
            FOLDER: { _NAME: `admin.${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail.folder` },
        },
    },
    AUTO_DORMANCY_CONFIGURATION: { _NAME: `admin.${MENU_ID.ADVANCED}.auto_dormancy_configuration` },
} as const;
