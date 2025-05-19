import type { Tags } from '@/api-clients/_common/schema/model';
import type { UserChannelScheduleInfoType } from '@/api-clients/alert-manager/user-channel/schema/type';

export interface UserChannelUpdateParameters {
    channel_id: string;
    name?: string;
    schedule?: UserChannelScheduleInfoType;
    tags?: Tags;
    data?: Record<string, any>;
}
