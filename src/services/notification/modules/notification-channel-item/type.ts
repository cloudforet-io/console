export const EDIT_TYPE = {
    NAME: 'name',
    DATA: 'data',
    SCHEDULE: 'schedule',
    TOPIC: 'topic',
    LEVEL: 'notification_level',
    USERS: 'users',
} as const;
// export type EditType = typeof EDIT_TYPE[keyof typeof EDIT_TYPE];

export const PARAM_KEY_TYPE = {
    NAME: 'name',
    DATA: 'data',
    SCHEDULE: 'schedule',
    LEVEL: 'notification_level',
    USERS: 'users',
} as const;
// export type ParamKeyType = typeof PARAM_KEY_TYPE[keyof typeof PARAM_KEY_TYPE];

export interface ParamType {
    user_channel_id?: string;
    project_channel_id?: string;
    name?: string;
    data?: any;
    schedule?: any;
    notification_level?: string;
}

export const PROTOCOL_TYPE = {
    AWS_SNS: 'AWS SNS',
    SLACK: 'Slack',
    VOICE_CALL: 'Voice Call',
} as const;
// export type ProtocolType = typeof PROTOCOL_TYPE[keyof typeof PROTOCOL_TYPE];
