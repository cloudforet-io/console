import { MENU_ID } from '@/lib/menu/config';

export const IAM_ROUTE = {
    _NAME: `${MENU_ID.IAM}`,
    USER: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.USER}`,
    },
    USER_GROUP: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.USER_GROUP}`,
    },
    APP: {
        _NAME: `${MENU_ID.IAM}.${MENU_ID.APP}`,
    },
} as const;
