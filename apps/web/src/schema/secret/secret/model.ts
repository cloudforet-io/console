import type { TimeStamp } from '@/schema/_common/model';

export interface CredentialModel {
    secret_id?: string;
    name?: string;
    secret_type?: string;
    schema?: string;
    provider?: string;
    service_account_id?: string;
    trusted_secret_id?: string;
    trusted_service_account_id?: string;
    project_id?: string;
    domain_id?: string;
    created_at?: TimeStamp;
    tags?: { [key: string]: any; };
}
