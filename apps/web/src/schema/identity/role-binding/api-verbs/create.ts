import type { ResourceGroupType } from '@/api-clients/_common/schema/type';

export interface RoleCreateParameters {
    user_id: string;
    role_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'DOMAIN'>;
    workspace_id?: string;
}
