import type { NotificationLevel, NotificationMessage, NotificationType } from '@/schema/notification/notification/type';

export interface NotificationModel {
    notification_id: string;
    topic: string;
    message: NotificationMessage;
    notification_type: NotificationType;
    notification_level: NotificationLevel;
    is_read: boolean;
    parent_notification_id: string;
    project_id: string;
    user_id: string;
    domain_id: string;
    created_at: string;
}
