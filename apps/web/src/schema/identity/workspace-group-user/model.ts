import type { Tags } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { UserState } from '@/schema/identity/user/type';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export interface WorkspaceGroupUserModel {
    workspace_group_id: string;
    name: string;
    workspaces: WorkspaceModel[];
    users: WorkspaceUser[];
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

export interface WorkspaceUser {
    user_id: string;
    role_id: string;
    role_type: RoleType;
}
