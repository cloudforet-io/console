import type { Tags } from '@/schema/_common/model';
import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';

export interface ServiceChannelCreateParameters {
    protocol_id: string;
    name: string;
    data: ServiceChannelDataType;
    schedule?: ServiceChannelScheduleInfoType;
    tags?: Tags;
    service_id: string;
}
