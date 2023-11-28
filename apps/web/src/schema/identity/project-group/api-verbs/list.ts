import type { Query } from '@cloudforet/core-lib/space-connector/type';


export interface ProjectGroupListRequestParams {
    query?: Query;
    project_group_id?: string;
    name?: string;
    parent_group_id?: string;
}
