import type { Tags } from '@/schema/_common/model';
import type { MembersType, ServiceOptionsType } from '@/schema/alert-manager/service/type';

export interface ServiceCreateParameters {
    name: string;
    service_key: string;
    description?: string;
    members?: Record<MembersType, string[]>;
    options?: ServiceOptionsType;
    tags?: Tags;
}
