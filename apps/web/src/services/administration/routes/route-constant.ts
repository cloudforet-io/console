import { MENU_ID } from '@/lib/menu/config';

export const ADMINISTRATION_ROUTE = {
    _NAME: MENU_ID.ADMINISTRATION,
    IAM: {
        _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}`,
        USER: {
            _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.USER}`,
        },
        APP: {
            _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.APP}`,
        },
        ROLE: {
            _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.ROLE}`,
            CREATE: {
                _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.ROLE}.create`,
            },
            EDIT: {
                _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.IAM}.${MENU_ID.ROLE}.edit`,
            },
        },
    },
    PREFERENCE: {
        _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.PREFERENCE}`,
        DOMAIN_SETTINGS: {
            _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.PREFERENCE}.${MENU_ID.DOMAIN_SETTINGS}`,
        },
        WORKSPACES: {
            _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.PREFERENCE}.${MENU_ID.WORKSPACES}`,
            CREATE: {
                _NAME: `${MENU_ID.ADMINISTRATION}.${MENU_ID.PREFERENCE}.${MENU_ID.WORKSPACES}.create`,
            },
        },
    },
} as const;
