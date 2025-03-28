import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_INFO_ROUTE = Object.freeze({
    _NAME: `admin.${MENU_ID.INFO}`,
    NOTICE: {
        _NAME: `admin.${MENU_ID.INFO}.${MENU_ID.NOTICE}`,
        CREATE: { _NAME: `admin.${MENU_ID.INFO}.${MENU_ID.NOTICE}.create` },
        UPDATE: { _NAME: `admin.${MENU_ID.INFO}.${MENU_ID.NOTICE}.update` },
        DETAIL: { _NAME: `admin.${MENU_ID.INFO}.${MENU_ID.NOTICE}.detail` },
    },
});
