import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserChannelScheduleInfoType, UserChannelStateType } from '@/api-clients/alert-manager/user-channel/schema/type';

export interface UserChannelModel {
    channel_id: string;
    name: string;
    state: UserChannelStateType;
    schedule: UserChannelScheduleInfoType;
    tags: Tags;
    user_secret_id: string;
    protocol_id: string;
    user_id: string
    domain_id: string;
    created_at: string;
}
