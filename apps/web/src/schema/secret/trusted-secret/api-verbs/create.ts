import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface TrustedSecretCreateParameters {
    name: string;
    data: Record<string, any>
    schema_id?: string,
    tags?: Tags,
    trusted_account_id?: string,
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id?: string,
}
