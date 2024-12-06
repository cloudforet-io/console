import { MENU_ID } from '@/lib/menu/config';

export const PROJECT_ROUTE_V2 = Object.freeze({
    _NAME: MENU_ID.PROJECT,
    DETAIL: {
        _NAME: `${MENU_ID.PROJECT}.detail`,
        TAB: {
            _NAME: `${MENU_ID.PROJECT}.detail.tab`,
            SUMMARY: { _NAME: `${MENU_ID.PROJECT}.detail.tab.summary` },
            DASHBOARD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.dashboard` },
        },
    },
});
