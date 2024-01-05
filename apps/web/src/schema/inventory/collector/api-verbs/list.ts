import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ScheduleState } from '@/schema/inventory/collector/type';

export interface CollectorListParameters {
    query?: Query;
    collector_id?: string;
    name?: string;
    secret_filter_state?: ScheduleState;
    schedule_state?: ScheduleState;
    plugin_id?: string;
    workspace_id?: string;
}
