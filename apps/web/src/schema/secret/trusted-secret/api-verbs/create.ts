import type { Tags } from '@/api-clients/_common/schema/model';
import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface TrustedSecretCreateParameters {
    name: string;
    data: Record<string, any>
    schema_id?: string,
    tags?: Tags,
    trusted_account_id?: string,
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    workspace_id?: string,
}
