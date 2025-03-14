import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { RoleType } from '@/api-clients/identity/role/type';


export interface RoleBindingModel {
    role_binding_id: string;
    role_type: RoleType;
    user_id: string;
    role_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'DOMAIN'>;
    workspace_id: string;
    workspace_group_id?: string;
    domain_id: string;
    created_at: string;
}
