import type { Tags } from '@/api-clients/_common/schema/model';

import type { UserGroupChannelScheduleInfoType } from '@/schema/alert-manager/user-group-channel/type';

export interface UserGroupChannelUpdateParameters {
    channel_id: string;
    name?: string;
    data: Record<string, any>;
    schedule?: UserGroupChannelScheduleInfoType;
    tags?: Tags;
}
