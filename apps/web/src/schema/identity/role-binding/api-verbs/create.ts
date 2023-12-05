import type { PermissionGroup } from '@/schema/identity/role-binding/type';

export interface RoleCreateParameters {
    user_id: string;
    role_id: string;
    permission_group: PermissionGroup;
    workspace_id?: string;
    // TODO: will be removed after the backend is ready
    domain_id: string;
}
