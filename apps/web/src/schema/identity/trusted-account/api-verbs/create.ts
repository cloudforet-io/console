import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface TrustedAccountCreateParameters {
    name: string;
    data: any;
    provider: string;
    resource_group: Extract<ResourceGroup, 'DOMAIN' | 'WORKSPACE'>;
    tags?: Tags;
    workspace_id?: string;
}
