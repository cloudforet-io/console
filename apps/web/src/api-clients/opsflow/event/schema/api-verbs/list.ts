import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EventType } from '@/api-clients/opsflow/event/schema/type';


export interface EventListParameters {
    query?: Query;
    task_id?: string;
    event_type?: EventType;
    user_type?: 'USER'|'APP';
    event_id?: string;
    project_id?: string;
    workspace_id?: string;
}
