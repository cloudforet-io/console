import { MENU_ID } from '@/lib/menu/config';

export const ALERT_MANAGER_ROUTE = Object.freeze({
    _NAME: MENU_ID.ALERT_MANAGER,
    SERVICE: {
        _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.SERVICE}`,
        CREATE: { _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.SERVICE}.create` },
        DETAIL: {
            _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.SERVICE}.detail`,
            WEBHOOK: {
                CREATE: { _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.SERVICE}.detail.webhook.create` },
            },
            NOTIFICATIONS: {
                CREATE: { _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.SERVICE}.detail.notification.create` },
            },
        },
    },
    ALERTS: {
        _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.ALERTS}`,
        DETAIL: { _NAME: `${MENU_ID.ALERT_MANAGER}.${MENU_ID.ALERTS}.detail` },
    },
});
