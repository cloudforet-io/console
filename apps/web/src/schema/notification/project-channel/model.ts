import type { Tags } from '@/schema/_common/model';
import type { NotificationLevel } from '@/schema/notification/notification/type';
import type { ChannelSchedule, ChannelState } from '@/schema/notification/type';

export interface ProjectChannelModel {
    project_channel_id: string;
    name: string;
    state: ChannelState;
    data: Record<string, any>;
    is_subscribe: boolean;
    subscriptions: string[]; // subscriptions(e.g.) = ['monitoring.Alert', 'power_scheduler.*', ...]
    is_scheduled: boolean;
    schedule: ChannelSchedule;
    notification_level: NotificationLevel;
    tags: Tags;
    secret_id: string;
    protocol_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
