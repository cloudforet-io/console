import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface SecretModel {
    secret_id: string;
    name: string;
    tags: Tags;
    schema_id: string;
    provider: string;
    service_account_id: string;
    trusted_secret_id?: string;
    resource_group: ResourceGroup;
    project_id: string;
    workspace_id?: string;
    created_at: string;
}
