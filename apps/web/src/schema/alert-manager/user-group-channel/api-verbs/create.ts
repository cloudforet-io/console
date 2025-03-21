import type { Tags } from '@/api-clients/_common/schema/model';
import type {
    UserGroupChannelScheduleInfoType,
} from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelCreateParameters {
    protocol_id: string;
    name: string;
    schedule?: UserGroupChannelScheduleInfoType;
    tags?: Tags;
    user_group_id: string;
    data: Record<string, any>;
}
