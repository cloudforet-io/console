import { MENU_ID } from '@/lib/menu/config';

export const DASHBOARD_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARD,
    DETAIL: {
        _NAME: `${MENU_ID.DASHBOARD}.detail`,
    },
    CUSTOMIZE_DETAIL: {
        _NAME: `${MENU_ID.DASHBOARD}.customize_detail`,
    },
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARD}.create`,
    },
    EDIT: {
        _NAME: `${MENU_ID.DASHBOARD}.edit`,
    },
});
