import type { Tags } from '@/schema/_common/model';

type WorkspaceState = 'ENABLED' | 'DISABLED';

export interface WorkspaceModel {
    workspace_id: string;
    name: string;
    state: WorkspaceState;
    tags: Tags;
    is_managed: boolean;
    reference_id: string;
    trusted_account_id: string;
    created_by: string;
    domain_id: string;
    created_at: string;
}
