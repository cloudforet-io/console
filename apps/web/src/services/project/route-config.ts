import { MENU_ID } from '@/lib/menu/config';

export const PROJECT_ROUTE = Object.freeze({
    _NAME: MENU_ID.PROJECT,
    DETAIL: {
        _NAME: `${MENU_ID.PROJECT}.detail`,
        TAB: {
            _NAME: `${MENU_ID.PROJECT}.detail.tab`,
            SUMMARY: { _NAME: `${MENU_ID.PROJECT}.detail.tab.summary` },
            MEMBER: { _NAME: `${MENU_ID.PROJECT}.detail.tab.member` },
            ALERT: {
                _NAME: `${MENU_ID.PROJECT}.detail.tab.alert`,
                ALERT: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.alert_list` },
                WEBHOOK: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.webhook` },
                MAINTENANCE_WINDOW: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.maintenance_window` },
                SETTINGS: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.settings` },
            },
            NOTIFICATIONS: {
                _NAME: `${MENU_ID.PROJECT}.detail.tab.notification`,
                ADD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.notification.add` },
            },
            TAG: { _NAME: `${MENU_ID.PROJECT}.detail.tab.tag` },
        },
        EVENT_RULE: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.event_rule` },
    },
});
