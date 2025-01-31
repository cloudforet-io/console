import type { Tags } from '@/api-clients/_common/schema/model';

export interface WebhookUpdateParameters {
    webhook_id: string;
    name?: string;
    tags?: Tags;
}

