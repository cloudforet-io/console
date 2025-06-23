import type { Tags } from '@/api-clients/_common/schema/model';
import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/api-clients/alert-manager/service-channel/schema/type';

export interface ServiceChannelCreateParameters {
    protocol_id: string;
    name: string;
    data: ServiceChannelDataType | Record<string, any>;
    schedule?: ServiceChannelScheduleInfoType;
    tags?: Tags;
    service_id: string;
}
