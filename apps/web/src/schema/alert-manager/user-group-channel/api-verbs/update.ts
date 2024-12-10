import type { Tags } from '@/schema/_common/model';
import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelUpdateParameters {
    channel_id: string;
    name?: string;
    schedule?: UserGroupChannelScheduleInfoType;
    tags?: Tags;
}
