import type { Tags } from '@/schema/_common/model';

export interface WorkspaceUpdateParameters {
    workspace_id: string;
    name: string;
    tags?: Tags;
}
