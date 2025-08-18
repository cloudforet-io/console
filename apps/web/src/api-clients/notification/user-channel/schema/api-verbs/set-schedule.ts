import type { ChannelSchedule } from '@/api-clients/notification/type';

export type UserChannelSetScheduleParameters = {
    user_channel_id: string
    is_scheduled?: boolean
    schedule?: ChannelSchedule;
};
