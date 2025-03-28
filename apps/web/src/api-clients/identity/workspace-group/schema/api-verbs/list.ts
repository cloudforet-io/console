import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WorkspaceGroupListParameters {
    query?: Query;
    workspace_group_id?: string;
    name?: string;
    created_by?: string;
    updated_by?: string;
}
