import { MENU_ID } from '@/lib/menu/config';

export const DASHBOARD_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARD,
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARD}.create`,
    },
    EDIT: {
        _NAME: `${MENU_ID.DASHBOARD}.edit`,
    },
});
