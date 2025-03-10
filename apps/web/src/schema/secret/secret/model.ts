import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface SecretModel {
    secret_id: string;
    name: string;
    schema_id: string;
    provider: string;
    tags: Tags;
    trusted_secret_id: string;
    service_account_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
