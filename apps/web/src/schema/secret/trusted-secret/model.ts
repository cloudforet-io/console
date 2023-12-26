import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface TrustedSecretModel {
    trusted_secret_id: string;
    name: string;
    tags: Tags;
    schema_id: string;
    provider: string;
    trusted_account_id: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id: string;
    created_at: TimeStamp;
}
