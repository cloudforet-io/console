import { MENU_ID } from '@/lib/menu/config';

export const INFO_ROUTE = Object.freeze({
    _NAME: MENU_ID.INFO,
    NOTICE: {
        _NAME: MENU_ID.INFO_NOTICE,
        CREATE: { _NAME: `${MENU_ID.INFO_NOTICE}.create` },
        UPDATE: { _NAME: `${MENU_ID.INFO_NOTICE}.update` },
        DETAIL: { _NAME: `${MENU_ID.INFO_NOTICE}.detail` },
    },
});
