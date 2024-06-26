import { MENU_ID } from '@/lib/menu/config';

export const PREFERENCE_ROUTE = {
    _NAME: `${MENU_ID.PREFERENCE}`,
    DOMAIN_SETTINGS: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}`,
        BASE_INFORMATION: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.base_information` },
        BRAND_ASSETS: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.brand_assets` },
        TIMEZONE_AND_LANGUAGE: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.timezone_and_language` },
        AUTO_DORMANCY_CONFIGURATION: { _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}.auto_dormancy_configuration` },
    },
    BOOKMARK: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.BOOKMARK}`,
    },
    WORKSPACES: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.WORKSPACES}`,
    },
} as const;
