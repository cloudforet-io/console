import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface TrustedAccountCreateParameters {
    name: string;
    data: Record<string, any>;
    provider: string;
    secret_schema_id: string;
    secret_data: Record<string, any>;
    tags?: Tags;
    resource_group: Extract<ResourceGroup, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id?: string;
}
