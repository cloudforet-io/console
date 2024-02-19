import { MENU_ID } from '@/lib/menu/config';

export const IAM_ROUTE = {
    _NAME: `${MENU_ID.IAM}`,
    USER: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.USER}`,
    },
    APP: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.APP}`,
    },
    ROLE: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.ROLE}`,
        CREATE: {
            _NAME: `${MENU_ID.IAM}.${MENU_ID.ROLE}.create`,
        },
        EDIT: {
            _NAME: `${MENU_ID.IAM}.${MENU_ID.ROLE}.edit`,
        },
    },
} as const;
