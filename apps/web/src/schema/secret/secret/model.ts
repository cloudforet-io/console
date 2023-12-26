import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface SecretModel {
    secret_id: string;
    name: string;
    tags: Tags;
    schema_id: string;
    provider: string;
    service_account_id: string;
    trusted_secret_id?: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    project_id: string;
    workspace_id?: string;
    created_at: string;
}
