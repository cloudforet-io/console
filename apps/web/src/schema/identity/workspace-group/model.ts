import type { Tags } from '@/schema/_common/model';

export interface WorkspaceGroupModel {
    workspace_group_id: string;
    name: string;
    workspaces: string[];
    users: string[];
    tags: Tags;
    created_by: string;
    updated_by: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
