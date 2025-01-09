import * as styles from '@/styles/colors';

export const SERVICE_DETAIL_TABS = {
    OVERVIEW: 'overview',
    ALERTS: 'alerts',
    WEBHOOK: 'webhook',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings',
} as const;
export const SERVICE_SETTING_CARD = {
    NOTIFICATION_POLICY: 'notification_policy',
    AUTO_RECOVERY: 'auto_recovery',
    EVENT_RULE: 'event_rule',
} as const;
export const SERVICE_TAB_HEIGHT = 44;

export const WEBHOOK_DETAIL_TABS = {
    DETAIL: 'detail',
    HELP: 'help',
    ERROR: 'error',
    MESSAGE: 'message',
} as const;

export const ALERT_MANAGER_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    DISABLED: {
        iconColor: styles.gray[400],
        textColor: styles.gray[400],
    },
} as const;

export const NOTIFICATIONS_DETAIL_TABS = {
    DETAIL: 'detail',
} as const;

export const EVENT_RULE_SETTINGS_TYPE = {
    ASSET: 'asset',
    ALERT: 'alert',
    SERVICE: 'service',
} as const;

