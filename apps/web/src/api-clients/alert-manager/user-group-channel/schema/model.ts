
import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    UserGroupChannelStateType,
    UserGroupChannelScheduleInfoType,
} from '@/api-clients/alert-manager/user-group-channel/schema/type';

export interface UserGroupChannelModel {
    channel_id: string;
    name: string;
    state: UserGroupChannelStateType;
    schedule: UserGroupChannelScheduleInfoType;
    tags: Tags;
    secret_id: string;
    protocol_id: string;
    user_group_id: string
    workspace_id: string;
    domain_id: string;
    created_at: string;
    data: Record<string, any>;
}
