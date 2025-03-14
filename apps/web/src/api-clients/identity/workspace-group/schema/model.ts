import type { Tags } from '@/api-clients/_common/schema/model';
import type { RoleType } from '@/api-clients/identity/role/type';
import type { UserState } from '@/api-clients/identity/user/schema/type';

export interface WorkspaceGroupModel {
    workspace_group_id: string;
    name: string;
    users: WorkspaceUser[];
    workspace_count: number;
    tags: Tags;
    domain_id: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export interface WorkspaceUser {
    user_id: string;
    role_id: string;
    role_type: RoleType;
    user_name: string;
    state: UserState;
}
