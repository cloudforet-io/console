import type { ChannelSchedule, ChannelState } from '@/schema/notification/type';

export interface UserChannelModel {
    user_channel_id: string;
    name: string;
    state: ChannelState;
    data: object;
    is_subscribe: boolean;
    subscriptions: string[]; // subscriptions(e.g.) = ['monitoring.Alert', 'power_scheduler.*', ...]
    is_scheduled: boolean;
    schedule: ChannelSchedule;
    tags: object;
    secret_id: string;
    protocol_id: string;
    user_id: string;
    domain_id: string;
    created_at: string;
}
