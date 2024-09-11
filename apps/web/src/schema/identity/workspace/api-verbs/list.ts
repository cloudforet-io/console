import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WorkspaceListParameters {
    query?: Query;
    workspace_id?: string;
    name?: string;
    created_by?: string;
    workspace_group_id?: string;
}
