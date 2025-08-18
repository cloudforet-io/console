import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface WebhookListErrorsParameters {
    query?: Query;
    webhook_id: string;
    error_id?: string;
}

