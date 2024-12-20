
import type { Tags } from '@/schema/_common/model';
import type { ServiceChannelDataType } from '@/schema/alert-manager/service-channel/type';
import type { UserGroupChannelStateType, UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

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
    data: ServiceChannelDataType;
}
