import type { Tags } from '@/schema/_common/model';
import type { ServiceChannelDataType } from '@/schema/alert-manager/service-channel/type';
import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelUpdateParameters {
    channel_id: string;
    name?: string;
    data: ServiceChannelDataType;
    schedule?: UserGroupChannelScheduleInfoType;
    tags?: Tags;
}
