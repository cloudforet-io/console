import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { WebhookStateType } from '@/schema/alert-manager/webhook/type';

export interface WebhookListParameters {
    query?: Query;
    webhook_id?: string;
    name?: string;
    state?: WebhookStateType;
    access_key?: string;
    service_id?: string;
    workspace_id?: string;
}

