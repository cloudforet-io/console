import type { ResourceGroupType } from '@/schema/_common/type';

export interface RoleCreateParameters {
    user_id: string;
    role_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'DOMAIN'>;
    workspace_id?: string[];
}
