import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ProjectListRequestParams {
    project_id?: string;
    query?: Query;
    name?: string;
    user_id?: string;
    user_group_id?: string;
    project_group_id?: string;
    workspace_id?: string;
}
