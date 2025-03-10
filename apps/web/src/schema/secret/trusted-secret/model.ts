import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface TrustedSecretModel {
    trusted_secret_id: string;
    name: string;
    schema_id: string;
    provider: string;
    tags: Tags;
    trusted_account_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}
