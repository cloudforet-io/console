import type { Tags } from '@/api-clients/_common/schema/model';
import type { ChannelSchedule } from '@/schema/notification/type';

export type UserChannelCreateParameters = {
    protocol_id: string
    name: string
    data: object
    is_subscribe?: boolean
    subscriptions?: string[]
    is_scheduled?: boolean
    schedule?: ChannelSchedule
    tags?: Tags
};
