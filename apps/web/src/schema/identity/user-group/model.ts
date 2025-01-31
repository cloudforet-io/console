import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserGroupChannelModel } from '@/schema/alert-manager/user-group-channel/model';

export interface UserGroupModel {
    user_group_id: string;
    name: string;
    description?: string;
    users: string[];
    tags: Tags;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    notification_channel: UserGroupChannelModel[];
}

export interface NotificationChannelPerUserGroupModel {
    name: string;
    channel: 'email' | 'sms' | 'ms_teams' | 'slack' | 'kakao_talk' | 'telegram' | 'notify_to_member_channel';
    schedule: 'custom' | 'every_day' | 'weekdays'
    details: string[];
}
