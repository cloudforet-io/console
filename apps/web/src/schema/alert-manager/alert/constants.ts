export const ALERT_STATUS = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    IGNORED: 'IGNORED',
} as const;

export const ALERT_URGENCY = {
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;

export const ALERT_SEVERITY = {
    CRITICAL: 'CRITICAL',
    ERROR: 'ERROR',
    WARNING: 'WARNING',
    INFO: 'INFO',
} as const;

export const ALERT_TRIGGERED_TYPE = {
    USER: 'USER',
    WEBHOOK: 'WEBHOOK',
} as const;

export const ALERT_EVENT_ACTION = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    NOTIFIED: 'NOTIFIED',
    EVENT_PUSHED: 'EVENT_PUSHED',
};
