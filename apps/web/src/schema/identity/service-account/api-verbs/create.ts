import type { Tags } from '@/schema/_common/model';

export interface ServiceAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    secret_schema_id?: string;
    secret_data?: any;
    tags?: Tags;
    trusted_account_id?: string;
    project_id: string;
}
