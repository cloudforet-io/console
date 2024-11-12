import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WorkflowEventListParameters {
    query?: Query;
    task_id?: string;
}
