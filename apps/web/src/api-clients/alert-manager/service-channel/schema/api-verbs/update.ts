import type { Tags } from '@/api-clients/_common/schema/model';
import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/api-clients/alert-manager/service-channel/schema/type';

export interface ServiceChannelUpdateParameters {
    channel_id: string;
    name?: string;
    data?: ServiceChannelDataType;
    schedule?: ServiceChannelScheduleInfoType;
    tags?: Tags;
}
