import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface TaskListParameters {
    query?: Query;
    task_id?: string;
    name?: string;
    status?: string;
    project_id?: string;
    workspace_id?: string;
}
