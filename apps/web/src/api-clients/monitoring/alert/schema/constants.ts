export const ALERT_STATE = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
} as const;

export const ALERT_URGENCY = {
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;
