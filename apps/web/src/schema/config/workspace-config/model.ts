import type { Tags } from '@/schema/_common/model';

export interface WorkspaceConfigModel<T = Record<string, any>> {
    name: string;
    data: T;
    tags: Tags;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
