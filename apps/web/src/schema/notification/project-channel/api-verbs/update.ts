import type { Tags } from '@/schema/_common/model';
import type { NotificationLevel } from '@/schema/notification/notification/type';

export type ProjectChannelUpdateParameters = {
    project_channel_id: string
    name?: string
    data?: object
    notification_level?: NotificationLevel
    tags?: Tags
};
