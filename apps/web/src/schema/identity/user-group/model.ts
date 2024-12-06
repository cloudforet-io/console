import type { AuthType } from '@/schema/identity/user/type';

export interface UserGroupModel {
    user_group_id: string;
    description: string;
    notification: number;
    users: number;
    created: string;
}

export interface UserPerUserGroupModel {
    user_id: string;
    name: string;
    auth_type: AuthType;
    last_activity: string;
}

export interface NotificationChannelPerUserGroupModel {
    name: string;
    channel: 'email' | 'sms' | 'ms_teams' | 'slack' | 'kakao_talk' | 'telegram' | 'notify_to_member_channel';
    schedule: 'custom' | 'every_day' | 'weekdays'
    details: string[];
}
