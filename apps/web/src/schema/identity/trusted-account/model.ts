import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface TrustedAccountModel {
    trusted_account_id: string;
    name: string;
    data: Record<string, any>;
    provider: string;
    tags: Tags;
    secret_schema_id: string;
    trusted_secret_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id: string;
    domain_id: string;
    created_at: string;
}


