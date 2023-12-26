import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { WebhookState } from '@/schema/monitoring/webhook/type';

export interface WebhookListParameters {
    webhook_id?: string;
    name?: string;
    state?: WebhookState;
    access_key?: string;
    workspace_id?: string;
    project_id?: string;
    query: Query;
}
