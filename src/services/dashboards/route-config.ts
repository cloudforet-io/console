import { MENU_ID } from '@/lib/menu/config';

<<<<<<< master:src/services/dashboard/route-config.ts
export const DASHBOARD_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARD,
    DETAIL: {
        _NAME: `${MENU_ID.DASHBOARD}.detail`,
    },
    CUSTOMIZE_DETAIL: {
        _NAME: `${MENU_ID.DASHBOARD}.customize_detail`,
=======
export const DASHBOARDS_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARDS,
    DETAIL: {
        _NAME: `${MENU_ID.DASHBOARDS}.detail`,
>>>>>>> fix(dashboards): fix dashboards directory name & add dashboard detail page:src/services/dashboards/route-config.ts
    },
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARDS}.create`,
    },
    EDIT: {
        _NAME: `${MENU_ID.DASHBOARDS}.edit`,
    },
});
