import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { WebhookStateType } from '@/api-clients/alert-manager/webhook/schema/type';

export interface WebhookListParameters {
    query?: Query;
    webhook_id?: string;
    name?: string;
    state?: WebhookStateType;
    access_key?: string;
    service_id?: string;
    workspace_id?: string;
}

