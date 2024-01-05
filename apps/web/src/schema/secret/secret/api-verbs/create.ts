import type { Tags } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';

export interface SecretCreateParameters {
    name: string;
    data: Record<string, any>;
    schema_id?: string;
    tags?: Tags;
    trusted_secret_id?: string;
    resource_group: Extract<ResourceGroupType, 'DOMAIN'|'WORKSPACE'|'PROJECT'>;
    workspace_id?: string;
    project_id?: string;
    service_account_id?: string;
}
