import { MENU_ID } from '@/lib/menu/config';

export const ADVANCED_ROUTE = {
    _NAME: `${MENU_ID.ADVANCED}`,
    WORKSPACES: { _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.WORKSPACES}` },
    PREFERENCES: {
        _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}`,
        DOMAIN_INFORMATION: { _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}.domain_information` },
        APPEARANCE: { _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.PREFERENCES}.appearance` },
    },
    BOOKMARK: {
        _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}`,
        DETAIL: {
            _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail`,
            GROUP: { _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail.group` },
            FOLDER: { _NAME: `${MENU_ID.ADVANCED}.${MENU_ID.BOOKMARK}.detail.folder` },
        },
    },
    AUTO_DORMANCY_CONFIGURATION: { _NAME: `${MENU_ID.ADVANCED}.auto_dormancy_configuration` },
} as const;
