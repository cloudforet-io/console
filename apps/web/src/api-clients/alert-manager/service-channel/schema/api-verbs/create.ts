import type { Tags } from '@/api-clients/_common/schema/model';

import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';

export interface ServiceChannelCreateParameters {
    protocol_id: string;
    name: string;
    data: ServiceChannelDataType | Record<string, any>;
    schedule?: ServiceChannelScheduleInfoType;
    tags?: Tags;
    service_id: string;
}
