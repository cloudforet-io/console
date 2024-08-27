import type { Tags } from '@/schema/_common/model';

export interface WorkspaceGroupUpdateParameters {
    workspace_group_id: string;
    name?: string;
    tags?: Tags;
}
