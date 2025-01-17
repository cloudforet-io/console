import type { Tags } from '@/schema/_common/model';
import type { UserChannelScheduleInfoType } from '@/schema/alert-manager/user-channel/type';

export interface UserChannelCreateParameters {
    protocol_id: string;
    name: string;
    schedule?: UserChannelScheduleInfoType;
    tags?: Tags;
}
