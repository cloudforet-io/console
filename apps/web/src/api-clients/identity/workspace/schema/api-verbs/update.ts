import type { Tags } from '@/api-clients/_common/schema/model';

export interface WorkspaceUpdateParameters {
    workspace_id: string;
    name?: string;
    tags?: Tags;
}
