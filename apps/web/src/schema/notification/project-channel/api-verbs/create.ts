import type { Tags } from '@/schema/_common/model';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ChannelSchedule } from '@/schema/notification/type';

export type ProjectChannelCreateParameters = {
    protocol_id: string
    name: string
    data: object
    is_subscribe?: boolean
    subscriptions?: string[]
    notification_level?: NotificationLevel
    is_scheduled?: boolean
    schedule?: ChannelSchedule;
    tags?: Tags
    project_id: string
};
