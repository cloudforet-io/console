import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_IAM_ROUTE = {
    _NAME: `admin.${MENU_ID.IAM}`,
    USER: {
        _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.USER}`,
    },
    USER_GROUP: {
        _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.USER_GROUP}`,
    },
    APP: {
        _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.APP}`,
    },
    ROLE: {
        _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.ROLE}`,
        CREATE: {
            _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.ROLE}.create`,
        },
        EDIT: {
            _NAME: `admin.${MENU_ID.IAM}.${MENU_ID.ROLE}.edit`,
        },
    },
} as const;

