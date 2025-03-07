import { MENU_ID } from '@/lib/menu/config';

export const DASHBOARDS_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARDS,
    ALL: {
        _NAME: `${MENU_ID.DASHBOARDS}.all`,
    },
    DETAIL: {
        _NAME: `${MENU_ID.DASHBOARDS}.detail`,
    },
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARDS}.create`,
    },
});
