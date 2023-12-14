import type { TimeStamp } from '@/schema/_common/model';
import type { ResourceGroupType } from '@/schema/_common/type';
import type { RoleType } from '@/schema/identity/role/type';


export interface RoleBindingModel {
    role_binding_id: string;
    role_type: RoleType;
    user_id: string;
    role_id: string;
    resource_group: Extract<ResourceGroupType, 'WORKSPACE'|'DOMAIN'>;
    created_at: TimeStamp;
    workspace_id: string;
    domain_id: string;
}
