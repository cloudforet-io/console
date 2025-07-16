import type { ChannelSchedule } from '@/api-clients/notification/type';

export type ProjectChannelSetScheduleParameters = {
    project_channel_id: string;
    is_scheduled?: boolean;
    schedule?: ChannelSchedule;
};
