import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface TrustedSecretCreateParameters {
    name: string;
    data: Record<string, any>
    tags?: Tags,
    schema_id?: string,
    trusted_account_id?: string,
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'>;
    project_id?: string,
    workspace_id?: string,
}
