import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface TaskTypeListParameters {
    query?: Query;
    task_type_id?: string;
    name?: string;
}
