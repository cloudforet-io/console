import type { Tags } from '@/api-clients/_common/schema/model';

export interface ServiceAccountUpdateParameters {
    service_account_id: string;
    name?: string;
    data?: Record<string, any>;
    tags?: Tags;
    service_account_mgr_id?: string;
    project_id?: string;
}
