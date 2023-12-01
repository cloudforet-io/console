import type { PermissionGroup } from '@/schema/identity/role-binding/type';

export interface RoleCreateRequestParameters {
    user_id: string;
    role_id: string;
    permission_group: PermissionGroup;
    workspace_id?: string;
}
