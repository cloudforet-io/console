import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ChannelSchedule } from '@/schema/notification/type';

export interface NotificationAddFormDataPayload {
    channelName: string;
    data: Record<string, any>;
    level: NotificationLevel;
    isValid: boolean;
}

export interface NotificationAddFormSchedulePayload {
    schedule: ChannelSchedule;
    is_scheduled: boolean;
    isScheduleValid: boolean;
}

export interface NotificationAddFormTopicPayload {
    topicMode: boolean;
    selectedTopic: string[];
    isTopicValid: boolean;
}
