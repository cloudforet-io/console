import { MENU_ID } from '@/lib/menu/config';

export const PREFERENCE_ROUTE = {
    _NAME: `${MENU_ID.PREFERENCE}`,
    DOMAIN_SETTINGS: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}`,
        DOMAIN_INFORMATION: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.domain_information` },
        APPEARANCE: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.appearance` },
        AUTO_DORMANCY_CONFIGURATION: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.auto_dormancy_configuration` },
    },
    BOOKMARK: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.BOOKMARK}`,
    },
    WORKSPACES: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.WORKSPACES}`,
    },
} as const;
