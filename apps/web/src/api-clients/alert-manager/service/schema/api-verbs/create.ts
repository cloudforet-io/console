import type { Tags } from '@/api-clients/_common/schema/model';
import type { MembersType, ServiceOptionsType } from '@/api-clients/alert-manager/service/schema/type';

export interface ServiceCreateParameters {
    name: string;
    service_key: string;
    description?: string;
    members?: Record<MembersType, string[]>;
    options?: ServiceOptionsType;
    tags?: Tags;
}
