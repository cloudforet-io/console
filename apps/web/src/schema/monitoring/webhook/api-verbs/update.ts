import type { Tags } from '@/schema/_common/model';

export interface WebhookUpdateParameters {
    webhook_id: string;
    name?: string;
    tags?: Tags;
}
