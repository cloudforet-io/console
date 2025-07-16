import type { NotificationLevel, NotificationMessage, NotificationType } from '@/api-clients/notification/notification/schema/type';

export interface NotificationPushParameters {
    protocol_id: string;
    data: string;
    message: NotificationMessage;
    notification_type?: NotificationType
    notification_level?: NotificationLevel
    topic?: string;
    domain_id: string;
}
