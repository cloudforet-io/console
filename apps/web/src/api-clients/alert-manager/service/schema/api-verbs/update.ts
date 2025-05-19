import type { Tags } from '@/api-clients/_common/schema/model';

import type { ServiceOptionsType } from '@/schema/alert-manager/service/type';

export interface ServiceUpdateParameters {
    service_id: string;
    name?: string;
    description?: string;
    options?: ServiceOptionsType;
    tags?: Tags;
    escalation_policy_id?: string;
}
