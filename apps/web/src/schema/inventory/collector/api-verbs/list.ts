import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { State } from '@/schema/inventory/collector/type';

export interface CollectorListParameters {
    query?: Query;
    collector_id?: string;
    name?: string;
    secret_filter_state?: State;
    schedule_state?: State;
    plugin_id?: string;
    workspace_id?: string;
}
