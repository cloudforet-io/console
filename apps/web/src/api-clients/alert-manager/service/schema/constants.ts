export const NOTIFICATION_URGENCY = {
    ALL: 'ALL',
    HIGH_ONLY: 'HIGH_ONLY',
} as const;

export const RECOVERY_MODE = {
    AUTO: 'AUTO',
    MANUAL: 'MANUAL',
} as const;

export const MEMBERS_TYPE = {
    USER: 'USER',
    USER_GROUP: 'USER_GROUP',
} as const;

export const SERVICE_ALERTS_TYPE = {
    TOTAL: 'TOTAL',
    TRIGGERED: 'TRIGGERED',
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    RESOLVED: 'RESOLVED',
} as const;

export const SERVICE_HEALTHY_TYPE = {
    HEALTHY: 'HEALTHY',
    UNHEALTHY: 'UNHEALTHY',
};
