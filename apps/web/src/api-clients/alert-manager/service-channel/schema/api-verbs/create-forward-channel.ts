import type { Tags } from '@/api-clients/_common/schema/model';

import type { ServiceChannelDataType, ServiceChannelScheduleInfoType } from '@/schema/alert-manager/service-channel/type';

export interface ServiceChannelCreateForwardChannelParameters {
    name: string;
    data: ServiceChannelDataType;
    schedule?: ServiceChannelScheduleInfoType;
    tags?: Tags;
    service_id: string;
}
