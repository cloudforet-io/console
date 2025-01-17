export const SERVICE_CHANNEL_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;

export const SERVICE_CHANNEL_TYPE = {
    DIRECT: 'DIRECT',
    FORWARD: 'FORWARD',
} as const;

export const SERVICE_CHANNEL_FORWARD_TYPE = {
    ALL_MEMBER: 'ALL_MEMBER',
    USER: 'USER',
    USER_GROUP: 'USER_GROUP',
} as const;

export const SERVICE_CHANNEL_SCHEDULE_TYPE = {
    ALL_DAY: 'ALL_DAY',
    WEEK_DAY: 'WEEK_DAY',
    WEEKEND: 'WEEKEND',
    CUSTOM: 'CUSTOM',
} as const;
