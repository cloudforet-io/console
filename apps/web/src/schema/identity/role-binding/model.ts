import type { TimeStamp } from '@/schema/_common/model';
import type { PermissionGroup } from '@/schema/identity/role-binding/type';
import type { RoleType } from '@/schema/identity/role/type';


export interface RoleBindingModel {
    role_binding_id: string;
    role_type: RoleType;
    user_id: string;
    role_id: string;
    created_at: TimeStamp;
    permission_group: PermissionGroup;
    workspace_id: string;
    domain_id: string;
}
