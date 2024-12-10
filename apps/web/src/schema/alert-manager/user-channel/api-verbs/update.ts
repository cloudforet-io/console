import type { Tags } from '@/schema/_common/model';
import type { UserChannelScheduleInfoType } from '@/schema/alert-manager/user-channel/type';

export interface UserChannelUpdateParameters {
    channel_id: string;
    name?: string;
    schedule?: UserChannelScheduleInfoType;
    tags?: Tags;
}
