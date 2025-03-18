import { MENU_ID } from '@/lib/menu/config';

export const PROJECT_ROUTE_V1 = Object.freeze({
    _NAME: MENU_ID.PROJECT,
    DETAIL: {
        _NAME: `${MENU_ID.PROJECT}.detail`,
        TAB: {
            _NAME: `${MENU_ID.PROJECT}.detail.tab`,
            SUMMARY: { _NAME: `${MENU_ID.PROJECT}.detail.tab.summary` },
            // MEMBER: { _NAME: `${MENU_ID.PROJECT}.detail.tab.member` },
            ALERT: {
                _NAME: `${MENU_ID.PROJECT}.detail.tab.alert`,
                WEBHOOK: {
                    CREATE: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.webhook.create` },
                },
            },
            NOTIFICATIONS: {
                _NAME: `${MENU_ID.PROJECT}.detail.tab.notification`,
                ADD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.notification.add` },
            },
            // TAG: { _NAME: `${MENU_ID.PROJECT}.detail.tab.tag` },
            DASHBOARD: { _NAME: `${MENU_ID.PROJECT}.detail.tab.dashboard` },
        },
        EVENT_RULE: { _NAME: `${MENU_ID.PROJECT}.detail.tab.alert.event_rule` },
    },
});
