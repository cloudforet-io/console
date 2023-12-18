import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface TrustedAccountListParameters {
    query?: any;
    trusted_account_id?: string;
    name?: string;
    provider?: string;
    resource_group?: Extract<ResourceGroup, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id?: string;
    domain_id?: string;
}
