import type { Tags } from '@/api-clients/_common/schema/model';
import type { NotificationLevel } from '@/api-clients/notification/notification/schema/type';

export type ProjectChannelUpdateParameters = {
    project_channel_id: string
    name?: string
    data?: object
    notification_level?: NotificationLevel
    tags?: Tags
};
