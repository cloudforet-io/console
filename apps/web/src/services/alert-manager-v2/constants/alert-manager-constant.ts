import * as styles from '@/styles/colors';
import {
    blue, coral, gray, red, violet, yellow,
} from '@/styles/colors';

import type { AlertSeverity } from '@/services/alert-manager-v2/types/alert-manager-type';

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

export const ALERT_STATUS_FILTER = {
    TRIGGERED: 'triggered',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved',
} as const;
export const ALERT_URGENCY_FILTER = {
    HIGH: 'High',
    LOW: 'Low',
    ERROR: 'ERROR',
} as const;
export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
    CRITICAL: 'Critical',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    NOT_AVAILABLE: 'Not Available',
    NONE: 'None',
};
export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
    CRITICAL: red[600],
    ERROR: coral[600],
    WARNING: yellow[600],
    INFO: blue[600],
    NOT_AVAILABLE: violet[800],
    NONE: gray[500],
};

export const WEBHOOK_DETAIL_TABS = {
    DETAIL: 'detail',
    HELP: 'help',
} as const;
export const WEBHOOK_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
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
export const NOTIFICATION_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
