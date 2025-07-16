import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { NotificationLevel, NotificationType } from '@/api-clients/notification/notification/schema/type';

export interface NotificationListParameters {
    query?: Query;
    notification_id?: string;
    topic?: string;
    notification_type?: NotificationType
    notification_level?: NotificationLevel
    is_read?: boolean;
    parent_notification_id?: string;
    project_id?: string;
}

