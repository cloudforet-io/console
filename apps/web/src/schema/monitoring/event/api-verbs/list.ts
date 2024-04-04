import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { AlertSeverity } from '@/schema/monitoring/alert/type';

export interface EventListParameters {
    event_id?: string;
    event_key?: string;
    event_type?: string;
    severity?: AlertSeverity;
    resource_id?: string;
    provider?: string;
    account?: string;
    alert_id?: string;
    webhook_id?: string;
    workspace_id?: string;
    project_id?: string;
    query?: Query;
}
