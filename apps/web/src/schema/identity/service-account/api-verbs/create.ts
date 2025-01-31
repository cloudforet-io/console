import type { Tags } from '@/api-clients/_common/schema/model';

export interface ServiceAccountCreateParameters {
    name: string;
    data: Record<string, any>;
    provider: string;
    secret_schema_id?: string;
    secret_data?: Record<string, any>;
    tags?: Tags;
    trusted_account_id?: string;
    project_id: string;
}
