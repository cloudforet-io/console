import type { Tags } from '@/api-clients/_common/schema/model';

export interface WorkspaceGroupUpdateParameters {
    workspace_group_id: string;
    name?: string;
    tags?: Tags;
}
