import * as styles from '@/styles/colors';
import {
    blue, coral, red, yellow,
} from '@/styles/colors';

export const SERVICE_DETAIL_TABS = {
    OVERVIEW: 'overview',
    WEBHOOK: 'webhook',
    NOTIFICATIONS: 'notifications',
    EVENT_RULE: 'event_rule',
    SETTINGS: 'settings',
} as const;
export const SERVICE_SETTING_CARD = {
    NOTIFICATION_POLICY: 'notification_policy',
    AUTO_RECOVERY: 'auto_recovery',
    RULE_SET: 'rule_set',
} as const;

export const ALERT_SEVERITY_COLORS = {
    CRITICAL: red[600],
    ERROR: coral[600],
    WARNING: yellow[600],
    INFO: blue[600],
} as const;
export const ALERT_STATUS_FILTERS = {
    OPEN: 'OPEN',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
} as const;

export const WEBHOOK_DETAIL_TABS = {
    DETAIL: 'detail',
    HELP: 'help',
} as const;
export const WEBHOOK_STATE_COLOR = {
    ENABLED: {
        iconColor: styles.safe,
        textColor: styles.gray[900],
    },
    PENDING: {
        iconColor: styles.yellow[500],
        textColor: styles.gray[900],
    },
} as const;

export const NOTIFICATIONS_DETAIL_TABS = {
    DETAIL: 'detail',
} as const;
