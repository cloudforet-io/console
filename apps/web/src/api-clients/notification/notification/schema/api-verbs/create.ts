import type {
    NotificationLevel, NotificationMessage, NotificationResourceType, NotificationType,
} from '@/api-clients/notification/notification/schema/type';

export interface NotificationCreateParameters {
    resource_type: NotificationResourceType;
    resource_id: string;
    topic: string;
    message: NotificationMessage;
    notification_type: NotificationType
    notification_level: NotificationLevel
    domain_id: string;
}
