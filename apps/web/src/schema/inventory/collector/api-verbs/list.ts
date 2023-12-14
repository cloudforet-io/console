import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { ResourceGroup } from '@/schema/identity/role-binding/type';
import type { State } from '@/schema/inventory/collector/type';

export interface CollectorListParameters {
    query?: Query;
    collector_id?: string;
    name?: string;
    secret_filter_state?: State;
    schedule_state?: State;
    plugin_id?: string;
    permission_group?: ResourceGroup;
    workspace_id?: string;
}
