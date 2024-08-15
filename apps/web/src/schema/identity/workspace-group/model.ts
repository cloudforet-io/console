import type { Tags } from '@/schema/_common/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

export interface WorkspaceGroupModel {
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
    name?: string;
    state: string;
    role: string;
}
