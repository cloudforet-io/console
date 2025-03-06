import { MENU_ID } from '@/lib/menu/config';

export const ADMIN_DASHBOARDS_ROUTE = Object.freeze({
    _NAME: `admin.${MENU_ID.DASHBOARDS}`,
    ALL: {
        _NAME: `admin.${MENU_ID.DASHBOARDS}.all`,
    },
    DETAIL: {
        _NAME: `admin.${MENU_ID.DASHBOARDS}.detail`,
    },
    CREATE: {
        _NAME: `admin.${MENU_ID.DASHBOARDS}.create`,
    },
});
