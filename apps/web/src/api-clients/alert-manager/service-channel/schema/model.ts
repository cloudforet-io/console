import type { Tags } from '@/api-clients/_common/schema/model';

import type {
    ServiceChannelDataType,
    ServiceChannelStateType,
    ServiceChannelType, ServiceChannelScheduleInfoType,
} from '@/schema/alert-manager/service-channel/type';

export interface ServiceChannelModel {
    channel_id: string;
    name: string;
    state: ServiceChannelStateType;
    channel_type: ServiceChannelType;
    data: ServiceChannelDataType;
    schedule: ServiceChannelScheduleInfoType;
    tags: Tags;
    secret_id: string;
    protocol_id: string;
    service_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
