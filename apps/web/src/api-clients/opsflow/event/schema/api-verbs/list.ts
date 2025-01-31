import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { EventType } from '../type';

export interface EventListParameters {
    query?: Query;
    task_id?: string;
    event_type?: EventType;
    user_type?: 'USER'|'APP'; // TODO: replace with UserType
    event_id?: string;
    project_id?: string;
    workspace_id?: string;
}
