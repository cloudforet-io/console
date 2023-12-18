import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';

export interface TrustedAccountModel {
    trusted_account_id: string;
    name: string;
    data: {
        [key: string]: string;
    },
    provider: string;
    tags: Tags;
    resource_group: Extract<ResourceGroup, 'DOMAIN' | 'WORKSPACE'>;
    workspace_id?: string;
    created_at?: string;
}


