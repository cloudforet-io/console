import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserChannelScheduleInfoType } from '@/api-clients/alert-manager/user-channel/schema/type';

export interface UserChannelCreateParameters {
    protocol_id: string;
    name: string;
    schedule?: UserChannelScheduleInfoType;
    tags?: Tags;
}
