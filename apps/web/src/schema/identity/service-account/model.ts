import type { Tags } from '@/schema/_common/model';

export interface ServiceAccountModel {
    service_account_id: string;
    name: string;
    data: Record<string, any>;
    provider: string;
    tags: Tags;
    secret_schema_id: string;
    secret_id: string;
    trusted_account_id: string;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}

