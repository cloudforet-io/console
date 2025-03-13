import type { Tags } from '@/api-clients/_common/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { UserState } from '@/schema/identity/user/type';

export interface WorkspaceGroupUserModel {
    workspace_group_id: string;
    name: string;
    workspaces: WorkspaceModel[];
    users: WorkspaceGroupUser[];
    tags: Tags;
    domain_id: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export interface WorkspaceGroupUserSummaryModel {
    user_id: string;
    name: string;
    state: UserState;
}

export interface WorkspaceGroupUser {
    user_id: string;
    role_id: string;
    role_type: RoleType;
    state: UserState;
}
