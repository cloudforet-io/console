import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WorkspaceListRequestParameters {
    query?: Query;
    workspace_id?: string;
    name?: string;
}
