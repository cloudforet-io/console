export const ALERT_SEVERITY = {
    CRITICAL: 'Critical',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    NOT_AVAILABLE: 'Not Available',
    NONE: 'None',
} as const;

export const ALERT_STATE = {
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
    ERROR: 'ERROR',
} as const;

export const ALERT_URGENCY = {
    ALL: 'ALL',
    HIGH: 'HIGH',
    LOW: 'LOW',
} as const;
