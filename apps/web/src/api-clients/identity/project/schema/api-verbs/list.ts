import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ProjectType } from '@/api-clients/identity/project/schema/type';


export interface ProjectListParameters {
    query?: Query;
    project_id?: string;
    name?: string;
    project_type?: ProjectType;
    created_by?: string;
    workspace_id?: string;
    project_group_id?: string;
    user_group_id?: string;
    user_id?: string;
}
