import { MENU_ID } from '@/lib/menu/config';

export const PROJECT_ROUTE = Object.freeze({
    _NAME: MENU_ID.PROJECT,
    DETAIL: {
        _NAME: `${MENU_ID.PROJECT}.detail`,
        TAB: {
            _NAME: `${MENU_ID.PROJECT}.detail.tab`,
            DASHBOARD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.dashboard` },
            MEMBER: { _NAME: `${MENU_ID.PROJECT}.detail.tab.member` },
            ALERT: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert` },
            NOTIFICATIONS: {
                _NAME: `${MENU_ID.PROJECT}.detail.tab.notification`,
                ADD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.notification.add` },
            },
            TAG: { _NAME: `${MENU_ID.PROJECT}.detail.tab.tag` },
        },
        EVENT_RULE: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.event_rule` },
    },
});
