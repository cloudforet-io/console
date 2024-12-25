import type { Tags } from '@/schema/_common/model';
import type { ServiceChannelDataType } from '@/schema/alert-manager/service-channel/type';
import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelCreateParameters {
    protocol_id: string;
    name: string;
    schedule?: UserGroupChannelScheduleInfoType;
    tags?: Tags;
    user_group_id: string;
    data: ServiceChannelDataType;
}
