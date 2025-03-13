import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { TaskPriority, TaskStatusType } from '@/api-clients/opsflow/task/schema/type';


export interface TaskListParameters {
    query?: Query;
    task_id?: string;
    name?: string;
    status_id?: string;
    status_type?: TaskStatusType;
    priority?: TaskPriority;
    task_type_id?: string;
    category_id?: string;
    project_id?: string;
    workspace_id?: string;
}
