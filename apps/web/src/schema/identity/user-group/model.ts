import type { Tags } from '@/schema/_common/model';
import type { UserModel } from '@/schema/identity/user/model';

export interface UserGroupModel {
    user_group_id: string;
    name: string;
    description?: string;
    users: UserModel[];
    tags: Tags;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}

export interface NotificationChannelPerUserGroupModel {
    name: string;
    channel: 'email' | 'sms' | 'ms_teams' | 'slack' | 'kakao_talk' | 'telegram' | 'notify_to_member_channel';
    schedule: 'custom' | 'every_day' | 'weekdays'
    details: string[];
}
