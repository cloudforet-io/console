import type { Tags } from '@/schema/_common/model';
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
