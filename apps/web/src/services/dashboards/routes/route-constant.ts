import { MENU_ID } from '@/lib/menu/config';

export const DASHBOARDS_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARDS,
    ALL: {
        _NAME: `${MENU_ID.DASHBOARDS}.all`,
    },
    PROJECT: {
        _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.PROJECT_DASHBOARDS}`,
        DETAIL: {
            _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.PROJECT_DASHBOARDS}.detail`,
        },
        CUSTOMIZE: {
            _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.PROJECT_DASHBOARDS}.customize`,
        },
    },
    WORKSPACE: {
        _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.WORKSPACE_DASHBOARDS}`,
        DETAIL: {
            _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.WORKSPACE_DASHBOARDS}.detail`,
        },
        CUSTOMIZE: {
            _NAME: `${MENU_ID.DASHBOARDS}.${MENU_ID.WORKSPACE_DASHBOARDS}.customize`,
        },
    },
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARDS}.create`,
    },
});
