import type { Tags } from '@/schema/_common/model';
import type { RoleType } from '@/schema/identity/role/type';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export interface WorkspaceGroupDetailsModel {
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

export interface WorkspaceUser {
    user_id: string;
    role_id: string;
    role_type: RoleType;
}
