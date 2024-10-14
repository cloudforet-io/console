import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WorkspaceGroupUserListParameters {
    workspace_group_id?: string;
    name?: string;
    query?: Query;
    created_by?: string;
    updated_by?: string;
}
