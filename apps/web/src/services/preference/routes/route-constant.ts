import { MENU_ID } from '@/lib/menu/config';

export const PREFERENCE_ROUTE = {
    _NAME: `${MENU_ID.PREFERENCE}`,
    DOMAIN_SETTINGS: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}`,
    },
    BOOKMARK: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.BOOKMARK}`,
    },
    WORKSPACES: {
        _NAME: `${MENU_ID.PREFERENCE}.${MENU_ID.WORKSPACES}`,
    },
} as const;
