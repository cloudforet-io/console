export const SERVICE_DETAIL_TABS = {
    OVERVIEW: 'overview',
    WEBHOOK: 'webhook',
    NOTIFICATIONS: 'notifications',
    EVENT_RULE: 'event_rule',
    ESCALATION_POLICY: 'escalation_policy',
} as const;

export const ALERT_STATUS_FILTER = {
    TRIGGERED: 'triggered',
    ACKNOWLEDGED: 'acknowledged',
    RESOLVED: 'resolved',
} as const;

export const ALERT_URGENCY_FILTER = {
    HIGH: 'High',
    LOW: 'Low',
} as const;
