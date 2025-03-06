import { MENU_ID } from '@/lib/menu/config';

export const INFO_ROUTE = Object.freeze({
    _NAME: MENU_ID.INFO,
    NOTICE: {
        _NAME: `${MENU_ID.INFO}.${MENU_ID.NOTICE}`,
        DETAIL: { _NAME: `${MENU_ID.INFO}.${MENU_ID.NOTICE}.detail` },
    },
});
