
type WorkspaceState = 'ENABLED' | 'DISABLED';

export interface WorkspaceModel {
    workspace_id: string;
    name: string;
    state: WorkspaceState;
    domain_id: string;
    created_at: string;
}
