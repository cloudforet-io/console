import { MENU_ID } from '@/lib/menu/config';

export const DASHBOARDS_ROUTE = Object.freeze({
    _NAME: MENU_ID.DASHBOARDS,
    ALL: {
        _NAME: `${MENU_ID.DASHBOARDS}.all`,
    },
    PROJECT: {
        _NAME: MENU_ID.DASHBOARDS_PROJECT,
        DETAIL: {
            _NAME: `${MENU_ID.DASHBOARDS_PROJECT}.detail`,
        },
        CUSTOMIZE: {
            _NAME: `${MENU_ID.DASHBOARDS_PROJECT}.customize`,
        },
    },
    WORKSPACE: {
        _NAME: MENU_ID.DASHBOARDS_WORKSPACE,
        DETAIL: {
            _NAME: `${MENU_ID.DASHBOARDS_WORKSPACE}.detail`,
        },
        CUSTOMIZE: {
            _NAME: `${MENU_ID.DASHBOARDS_WORKSPACE}.customize`,
        },
    },
    CREATE: {
        _NAME: `${MENU_ID.DASHBOARDS}.create`,
    },
});
